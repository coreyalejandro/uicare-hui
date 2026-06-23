#!/bin/bash
# UICare Deployment Assistant (Bash 3.2+ compatible)

set -eo pipefail

# -----------[ CONFIGURATION ]-----------
ACR_NAME="uicarehackathon"
RG_NAME="uicare-rg"
CLUSTER_NAME="uicare-cluster"
IMAGES="monitor-agent rescue-agent"

# -----------[ FUNCTIONS ]-----------
check_dependencies() {
    echo "Checking tools..."
    for tool in az docker envsubst kubectl; do
        if ! command -v "$tool" >/dev/null; then
            echo "Error: Missing $tool"
            exit 1
        fi
    done
}

setup_acr() {
    echo "Setting up ACR..."
    if ! az acr show --name "$ACR_NAME" --resource-group "$RG_NAME" >/dev/null 2>&1; then
        az acr create \
            --resource-group "$RG_NAME" \
            --name "$ACR_NAME" \
            --sku Basic \
            --admin-enabled true
    fi
    ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RG_NAME" --query loginServer -o tsv)
}

build_images() {
    echo "Building images..."
    az acr login --name "$ACR_NAME"
    for image in $IMAGES; do
        docker build -t "$ACR_LOGIN_SERVER/$image:latest" .
        docker push "$ACR_LOGIN_SERVER/$image:latest"
    done
}

setup_aks() {
    echo "Preparing AKS..."
    if ! az aks show --resource-group "$RG_NAME" --name "$CLUSTER_NAME" >/dev/null 2>&1; then
        az aks create \
            --resource-group "$RG_NAME" \
            --name "$CLUSTER_NAME" \
            --node-count 1 \
            --enable-addons monitoring \
            --generate-ssh-keys
    fi
    az aks get-credentials --resource-group "$RG_NAME" --name "$CLUSTER_NAME" --overwrite-existing
}

deploy_k8s() {
    echo "Deploying to Kubernetes..."
    if [ ! -f "deployment.yaml" ]; then
        echo "Error: Missing deployment.yaml"
        exit 1
    fi
    export REGISTRY="$ACR_LOGIN_SERVER"
    envsubst < deployment.yaml | kubectl apply -f -
}

# -----------[ MAIN SCRIPT ]-----------
main() {
    check_dependencies
    setup_acr
    build_images
    setup_aks
    deploy_k8s
    
    echo -e "
Deployment complete!"
    echo "Check your pods with: kubectl get pods"
}

main "$@"
