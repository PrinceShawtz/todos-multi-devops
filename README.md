# 📝 todo-app-devops

### 🚀 A Multi-Component To-Do Application Demonstrating a Full DevOps Pipeline

[![CI/CD Status](https://img.shields.io/badge/CI/CD-Jenkins%20Pipeline-blue)](./Jenkinsfile)
[![Orchestration](https://img.shields.io/badge/Orchestration-Kubernetes-informational)](./k8s)
[![Containerized](https://img.shields.io/badge/Containerization-Docker-0db7ed)](./Dockerfile)
[![Code Quality](https://img.shields.io/badge/Quality-SonarQube-yellow)](./sonar-project.properties)

This repository hosts a multi-component To-Do List application designed primarily as an educational resource and working example of **end-to-end DevOps automation**. It showcases how to containerize, test, and deploy a multi-tier application using industry-standard tools like Docker, Jenkins, and Kubernetes.
This usecase demonstrates a complete DevOps workflow for a Node.js Todo application, from source code management in GitHub to CI/CD with Jenkins, and deployment on Azure Kubernetes Service (AKS). The goal is to implement a modern DevOps pipeline that includes static code analysis, automated Docker builds, approval-based deployment, pod autoscaling, persistent storage, and rollback mechanisms.

---
## Key parts
   * Build
   * Static Code Analysis (SonarQube)
   * Containerization (Docker)
   * Deployment to AKS
   * Kubernetes manages pods  
   * Branching & PR Validation
   * Code quality
   * Approval before merging
   * Pod Scaling & Rollbacks Kubernetes - Horizontal Pod Autoscaling (HPA) - manages scaling based on CPU/memory.
---
## ✨ Features

### Application Features
* **CRUD Operations:** Create, Read, Update, and Delete (CRUD) To-Do items.
* **Multi-Tier Architecture:** Separate components for the frontend interface (`myapp`) and the backend API (`backend`).

### DevOps & Automation Features
* **Containerization:** Full **Docker** support via `Dockerfile` for consistent environments.
* **CI/CD Pipeline:** Automated build, test, and deployment pipeline defined in **`Jenkinsfile`**.
* **Kubernetes Orchestration:** Production-ready deployment manifest files in the **`k8s/`** directory for cluster management.
* **Code Quality:** Integration with **SonarQube/SonarCloud** for static code analysis, configured via **`sonar-project.properties`**.

---

## ⚙️ Technologies Used

| Component | Primary Technologies | DevOps Tooling |
| :--- | :--- | :--- |
| **Frontend (`myapp`)** | JavaScript, HTML, Smarty | Docker |
| **Backend (`backend`)** | JavaScript (Node.js/Express) | Docker |
| **Deployment** | Helms | Jenkins, Kubernetes, SonarQube |

- Node.js – Backend API
- Docker – Containerization
- Jenkins – CI/CD Pipeline
- SonarQube – Static Code Analysis
- Azure Kubernetes Service (AKS) – Deployment and scaling
- Persistent Volume Claims (PVC) – Data storage
- Horizontal Pod Autoscaler (HPA) – Dynamic scaling

---

## 🛠️ Prerequisites

To successfully deploy and run this project through its intended pipeline, you will need:

* **Runtime:** Node.js / npm
* **Containerization:** Docker
* **Orchestration:** Kubernetes Cluster Access (e.g., Minikube, k3s) and `kubectl`
* **Automation:** A running Jenkins Server (configured with necessary plugins)
* **Quality:** SonarQube or SonarCloud instance (optional, for code quality gate)

### install jenkins in my Ubuntu VM
```
helm repo add jenkins https://charts.jenkins.io  
helm repo update  
helm install jenkins jenkins/jenkins --namespace jenkins --create-namespace  
```
checking jenkins 
```
helm repo list
```
Check pods  
```
k get pods
k get svc
```

### Configure Jenkins Pipeline
- Add credentials: Docker Hub, Azure, SonarQube.
- Add webhook in GitHub for automatic builds.
- Deploy
- Push changes to main branch.
- Approve deployment in Jenkins.
- Access Todo app in AKS via exposed service.
![Jenkins Pipeline ](https://github.com/vibincholayil/todo-app-devops/blob/main/images/SS-pipeline.png)


### install Azure CLI
```
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash  
az version
```
### Install kubectl
```
sudo apt-get update  
sudo apt-get install -y apt-transport-https ca-certificates curl  
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg  
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" |   sudo tee /etc/apt/sources.list.d/kubernetes.list  
sudo apt-get update  
sudo apt-get install -y kubectl  
kubectl version --client  
```
### Login to Azure Using Service Principal
```
az login --service-principal --username <APP_ID> --password <PASSWORD> --tenant <TENANT_ID>  
az account show
```
### Connect to AKS Cluster
```
az aks get-credentials --resource-group rg-uk-dev-app --name aks-uk-dev-app --overwrite-existing  
kubectl get nodes  
```
### Static Code Analysis (SonarQube)

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash  
helm repo add sonarqube https://SonarSource.github.io/helm-chart-sonarqube  
helm repo update  
helm pull sonarqube/sonarqube --untar  
```
This creates a folder with the default SonarQube chart.  

#### Update Chart Values
Edit the `values.yaml` file to customize your deployment:  
* Set `service.type` to `LoadBalancer` (because AKS requires LB for external access).
* Disable Ingress: `ingress.enabled: false`
* Set `postgresql.postgresqlPassword` (enable a secure passcode).
* Optional: Set `persistence.enabled: false` if persistent storage is not required.

#### Deploy SonarQube on AKS
```bash
helm install sonarqube ./sonarqube
helm install sonarqube ./sonarqube --namespace team-a -f ./sonarqube/value_1.yaml
```
This will deploy SonarQube in your AKS cluster.

#### Verify SonarQube Deployment
```bash
kubectl get pods
kubectl get svc
```
#### Login to Azure
```bash
az login
```

### Get AKS Cluster Credentials
To connect to your hosted AKS cluster, use the following command:  
```bash
az aks get-credentials --resource-group rg-uk-dev-app --name aks-uk-dev-app --overwrite-existing  
```

### Verify `kubectl` Connection

```bash
kubectl get nodes
```

### 5) Pod Autoscaling
- Horizontal Pod Autoscaler (HPA) configured  
- Scales replicas based on CPU utilization targets  50%  
- HPA manifest stored in `k8s/hpa.yaml`  

### 6) Storage Persistence
- PersistentVolumeClaim (PVC) for stateful components  
- Ensures data durability across pod restarts  
- PVC manifest stored in `k8s/pvc.yaml`

### 7) Deployment Rollbacks
- Safe rollback to the previous ReplicaSet if deployment fails:  
```bash
kubectl rollout undo deployment todo-app -n team-a
```
---

## 🚀 Deployment via Jenkins CI/CD

The intended workflow is fully automated through the `Jenkinsfile`.

1.  **Fork and Clone** the repository.
2.  **Configure Jenkins:** Create a new **Pipeline** job in your Jenkins instance and point it to the repository's main branch.
3.  **Set Environment Secrets:** Ensure your Jenkins pipeline has access to necessary secrets (e.g., Docker Registry credentials, Kubeconfig details, SonarQube Token).
4.  **Trigger the Build:** A push to the `main` branch will initiate the pipeline, which executes the following stages:
    * **Build:** Builds Docker images for both `backend` and `myapp`.
    * **Test:** Runs unit and integration tests.
    * **Quality Gate:** Runs static analysis via SonarQube/SonarCloud.
    * **Deploy:** Applies the Kubernetes manifests from the `k8s/` directory to deploy the application.
  
## ⚙️ Jenkins CI/CD Pipeline (`Jenkinsfile`)

The `Jenkinsfile` defines a comprehensive, automated pipeline that orchestrates the entire deployment process for the multi-component application. This ensures that every code change is consistently built, tested, and deployed to a Kubernetes cluster only if all quality standards are met.

---

### Pipeline Flow

The automated workflow follows four major stages:

| Stage | Description | Key Actions | Tools Used |
| :--- | :--- | :--- | :--- |
| **1. Build & Push Images** | Creates immutable containers for both the frontend and backend. | <ul><li>Build Docker images using the respective `Dockerfile`s.</li><li>Tag and push the new images to a container registry.</li></ul> | Docker |
| **2. Tests** | Ensures the new code changes haven't introduced regressions. | <ul><li>Run **Unit Tests** for both application components.</li><li>Run **Integration Tests** to verify API communication.</li></ul> | npm/Yarn, Test Frameworks |
| **3. Quality Gate** | Validates the code's quality, security, and maintainability. | <ul><li>Executes a static code analysis using the **`sonar-project.properties`**.</li><li>**Pauses** the pipeline until the Quality Gate result from SonarQube/SonarCloud is *Passed*. If failed, the deployment is aborted.</li></ul> | SonarQube/SonarCloud |
| **4. Deploy to K8s** | The final step that deploys the verified application to the cluster. | <ul><li>Substitutes the new Docker image tag (Build ID) into the Kubernetes YAML files.</li><li>Applies the manifests from the **`k8s/`** directory using `kubectl`.</li></ul> | Kubernetes (`kubectl`) |

## 🐳 Local Development (Manual Docker)

For quick local setup, you can manually build and run the containers:

```bash
# 1. Build the backend image
docker build -t todos-backend ./backend

# 2. Build the frontend image
docker build -t todos-frontend ./myapp

# 3. Run the backend (assuming it listens on a default port, e.g., 8080)
docker run -d --name todo-backend todos-backend

# 4. Run the frontend (exposing it locally on port 3000) and link to the backend
# Adjust the backend service URL in the frontend code if necessary.
docker run -d -p 3000:3000 --name todo-frontend --link todo-backend todos-frontend

## Conclusion

This project demonstrates a full end-to-end DevOps workflow for a Node.js Todo application, combining best practices in source code management, CI/CD automation, containerization, and cloud-native deployment on Azure Kubernetes Service (AKS).  By implementing branching strategies, PR validation, conditional pipeline stages, static code analysis, approval-based deployments, pod autoscaling, persistent storage, and deployment rollbacks, this project ensures: High code quality and maintainability, Automated, repeatable, and reliable deployments, Scalable and resilient application infrastructure, Controlled production releases with safety mechanisms  

Overall, this project highlights how modern DevOps practices can streamline development, improve collaboration, and deliver robust cloud-native applications efficiently with Azure and Jenkins.

Thank you,
Eseroghene Okobiah.
