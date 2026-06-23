#!/bin/bash

# Exit on error
set -e

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Set up Azure Container Registry
echo "Setting up Azure Container Registry..."
ACR_NAME="uicarehackathon"
RG_NAME="uicare-rg"

# Create ACR if it doesn't exist
az acr create --resource-group $RG_NAME --name $ACR_NAME --sku Basic --admin-enabled true

# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $RG_NAME --query loginServer -o tsv)
echo "ACR Login Server: $ACR_LOGIN_SERVER"

# Login to ACR
echo "Logging into ACR..."
az acr login --name $ACR_NAME

# Set the registry for our deployment
export REGISTRY=$ACR_LOGIN_SERVER

# Build and push images
echo "Building and pushing Docker images..."
docker build -t $REGISTRY/monitor-agent:latest .
docker build -t $REGISTRY/rescue-agent:latest .
docker push $REGISTRY/monitor-agent:latest
docker push $REGISTRY/rescue-agent:latest

# Create AKS cluster if it doesn't exist
CLUSTER_NAME="uicare-cluster"
if ! az aks show --resource-group $RG_NAME --name $CLUSTER_NAME &> /dev/null; then
    echo "Creating AKS cluster..."
    az aks create \
        --resource-group $RG_NAME \
        --name $CLUSTER_NAME \
        --node-count 1 \
        --enable-addons monitoring \
        --generate-ssh-keys
fi

# Get AKS credentials
echo "Getting AKS credentials..."
az aks get-credentials --resource-group $RG_NAME --name $CLUSTER_NAME

# Deploy to Kubernetes
echo "Deploying to Kubernetes..."
envsubst < deployment.yaml | kubectl apply -f -

echo "Deployment completed successfully!"