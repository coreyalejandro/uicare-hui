#!/usr/bin/env bash
# setup_uicare.sh
# Deterministic Azure environment setup for UICare hackathon with full error recovery
# Usage: ./setup_uicare.sh [--retry] [--debug]

set -eo pipefail

### 1. Configuration Management ###
CONFIG_FILE="uicare_config.yaml"
readonly CONFIG_FILE

# Load configuration with validation
load_config() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        echo "❌ Missing configuration file: $CONFIG_FILE" >&2
        exit 1
    fi
    
    # Parse YAML and validate required fields
    local required="subscription resource_group location ml_workspace ml_project openai_account openai_model"
    local missing_fields=""
    
    while IFS=': ' read -r key value || [ -n "$key" ]; do
        # Skip empty lines and comments
        [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
        
        # Trim whitespace
        key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        value=$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        
        # Export as environment variable if value exists
        if [[ -n "$value" ]]; then
            export "CONFIG_${key}=${value}"
        fi
    done < "$CONFIG_FILE"

    # Validate required values
    for key in $required; do
        if [[ -z "$(eval echo \$CONFIG_${key})" ]]; then
            missing_fields="${missing_fields}${key} "
        fi
    done

    if [[ -n "$missing_fields" ]]; then
        echo "❌ Missing required config fields: ${missing_fields}" >&2
        exit 1
    fi
}

### 2. Enhanced Logging System ###
LOG_FILE="uicare_install.log"
exec 3>&1 4>&2
trap 'exec 2>&4 1>&3' EXIT
exec > >(tee -a "$LOG_FILE") 2>&1

log() {
    echo -e "[$(date +'%T')] $1" | tee /dev/fd/3
}

### 3. Dependency Management ###
verify_environment() {
    log "🔍 Verifying Azure environment"
    
    # Subscription check
    if ! az account show --output none 2>/dev/null; then
        log "❌ No active Azure subscription. Run 'az login' first."
        exit 1
    fi
    
    # CLI version check
    local cli_version=$(az version --query "\"azure-cli\"" -o tsv)
    if [[ $(echo "$cli_version" | cut -d'.' -f1) -lt 2 ]]; then
        log "❌ Azure CLI version 2.0+ required. Current: $cli_version"
        exit 1
    fi

    # Extension management
    local exts="ml"
    for ext in $exts; do
        if ! az extension show --name "$ext" --output none 2>/dev/null; then
            log "🔧 Installing extension: $ext"
            az extension add --name "$ext" --yes --output none
        fi
    done
}

### 4. Resource Creation with Retry Logic ###
create_resource_with_retry() {
    local resource_type=$1
    local create_cmd=$2
    local check_cmd=$3
    local max_retries=3
    local retries=0

    while [[ $retries -lt $max_retries ]]; do
        if eval "$check_cmd" >/dev/null 2>&1; then
            log "✅ $resource_type already exists"
            return 0
        fi

        if eval "$create_cmd"; then
            log "✅ Successfully created $resource_type"
            return 0
        else
            ((retries++))
            log "⚠️ Attempt $retries/$max_retries failed for $resource_type"
            sleep $((retries * 5))
        fi
    done

    log "❌ Failed to create $resource_type after $max_retries attempts"
    return 1
}

### 5. Main Workflow Components ###
create_ml_infra() {
    log "🚀 Creating ML infrastructure"
    
    # Resource Group
    create_resource_with_retry \
        "Resource Group" \
        "az group create --name '$CONFIG_resource_group' --location '$CONFIG_location' --subscription '$CONFIG_subscription' --output none" \
        "az group exists --name '$CONFIG_resource_group' --subscription '$CONFIG_subscription'"

    # ML Workspace
    create_resource_with_retry \
        "ML Workspace" \
        "az ml workspace create --resource-group '$CONFIG_resource_group' --name '$CONFIG_ml_workspace' --location '$CONFIG_location' --subscription '$CONFIG_subscription' --output none" \
        "az ml workspace show --resource-group '$CONFIG_resource_group' --name '$CONFIG_ml_workspace' --subscription '$CONFIG_subscription' --output none"

    # Create compute cluster instead of project (projects are managed differently now)
    create_resource_with_retry \
        "ML Compute" \
        "az ml compute create --name '${CONFIG_ml_project}-compute' --size Standard_DS3_v2 --min-instances 0 --max-instances 2 --type AmlCompute --resource-group '$CONFIG_resource_group' --workspace-name '$CONFIG_ml_workspace' --subscription '$CONFIG_subscription' --output none" \
        "az ml compute show --name '${CONFIG_ml_project}-compute' --resource-group '$CONFIG_resource_group' --workspace-name '$CONFIG_ml_workspace' --subscription '$CONFIG_subscription' --output none"
}

deploy_openai_model() {
    log "🧠 Deploying OpenAI model"
    
    # OpenAI Account
    create_resource_with_retry \
        "OpenAI Account" \
        "az cognitiveservices account create --name '$CONFIG_openai_account' --resource-group '$CONFIG_resource_group' --location '$CONFIG_location' --kind 'OpenAI' --sku '${CONFIG_openai_sku:-S0}' --subscription '$CONFIG_subscription' --output none" \
        "az cognitiveservices account show --name '$CONFIG_openai_account' --resource-group '$CONFIG_resource_group' --subscription '$CONFIG_subscription' --output none"

    # Model deployment
    local deploy_cmd="az cognitiveservices account deployment create \
        --deployment-name '${CONFIG_openai_deploy_name:-default}' \
        --name '$CONFIG_openai_account' \
        --model-name '$CONFIG_openai_model' \
        --model-version '${CONFIG_openai_model_version:-latest}' \
        --model-format OpenAI \
        --resource-group '$CONFIG_resource_group' \
        --subscription '$CONFIG_subscription' \
        --output none"

    create_resource_with_retry \
        "OpenAI Deployment" \
        "$deploy_cmd" \
        "az cognitiveservices account deployment show --deployment-name '${CONFIG_openai_deploy_name:-default}' --name '$CONFIG_openai_account' --resource-group '$CONFIG_resource_group' --subscription '$CONFIG_subscription' --output none"
}

### 6. Post-Deployment Validation ###
validate_environment() {
    log "🔬 Running validation checks"
    
    local success=true

    if ! az ml workspace show --name "$CONFIG_ml_workspace" >/dev/null 2>&1; then
        log "❌ Validation failed: ML_WORKSPACE"
        success=false
    fi

    if ! az cognitiveservices account show --name "$CONFIG_openai_account" >/dev/null 2>&1; then
        log "❌ Validation failed: OPENAI_ACCOUNT"
        success=false
    fi

    if $success; then
        log "✅ All resources validated successfully"
        return 0
    else
        log "❌ Some resources failed validation"
        return 1
    fi
}

### 7. Main Execution Flow ###
main() {
    load_config
    verify_environment
    create_ml_infra
    deploy_openai_model
    
    if validate_environment; then
        log "🎉 Setup completed successfully!"
        echo "ML Workspace URL: https://ml.azure.com/ws/${CONFIG_ml_workspace}/home"
        echo "OpenAI Endpoint: https://${CONFIG_openai_account}.openai.azure.com/"
    else
        log "⚠️ Setup completed with warnings. Check $LOG_FILE for details."
        exit 1
    fi
}

# Entry point
main "$@"