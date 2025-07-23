pipeline {
  agent any

  environment {
    NODE_ENV = "development"
  }

  tools {
    nodejs "NodeJS 20.19.0"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Yarn & Dependencies') {
      steps {
        sh 'npm install -g yarn'
        sh 'yarn --version'
        sh 'yarn install'
      }
    }

    stage('Lint') {
      steps {
        sh 'yarn lint'
      }
    }

    stage('Build') {
      steps {
        sh 'NODE_ENV=production yarn build'
      }
    }

    stage('Test') {
      steps {
        sh 'yarn test'
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('SonarQube') {
          sh 'npx sonar-scanner'
        }
      }
    }
  }

  post {
    success {
      echo '✅ Build, Lint, Test, dan SonarQube analysis sukses!'
    }
    failure {
      echo '❌ Build, Lint, Test, atau SonarQube analysis gagal.'
    }
  }
}