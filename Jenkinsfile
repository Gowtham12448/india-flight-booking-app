pipeline {
    agent any 
    tools {
        nodejs 'node20'
    }
    stages {
        stage ("Code") {
            steps {
                git branch: 'practice', url: 'https://github.com/Gowtham12448/india-flight-booking-app.git'
            }
        }
        stage ("Build") {
            steps {
                sh 'npm ci'
                sh 'npm test'
            }
        }
    }
}
