// AppDir
// BackupDir
def InstallBuild(BRANCH, APP_DIR){
    try {
        sh "cp ${APP_DIR}/.env . "
        echo 'Installing Dependencies'
        sh "SENTRYCLI_CDNURL=https://mekdep.edu.tm/landing-uploads/ CYPRESS_INSTALL_BINARY=/home/akynyaz/cypress.zip npm install"

        if (BRANCH == 'stable') {
            echo 'Building application'
            sh "npm run build"
            sh "cp -R .next public node_modules package.json package-lock.json ${OUT_DIR}"
        } else {
            echo 'Building application'
            sh "npm run build"
        }
    }
    catch (Exception e) {
        echo "Failed_reason: ${e}"
    }
}

def Deploy(Branch, APP_NAME) {
    try {
        echo 'Copying deploy script'
        sh 'cp /home/akynyaz/scripts/deploy/* .'
        echo 'Restarting application'
        if (env.BRANCH_NAME == 'stable') {
            sh "bash deploy.sh ${Branch} ${APP_NAME} "
            sh "pm2 restart ${APP_NAME}_web"
        } else {
            sh "bash deploy.sh ${Branch} "
            sh "pm2 restart ${APP_NAME}"
        }
    } catch (Exception e) {
        echo "Deployment Failed for  ${APP_NAME}, REASION: ${e}"
        rollback(Branch, APP_NAME)
    }
}

def rollback(Branch, APP_NAME) {
    echo "Restoring Previous Version of ${AppName}"
    if (env.BRANCH_NAME == 'stable') {
        echo "Deploying for ${Branch}"
        sh "bash rollback.sh ${Branch} ${APP_NAME}"
        echo 'Restarting application'
        sh "pm2 restart ${APP_NAME}_web"
    } else {
        sh "bash rollback.sh ${Branch}"
        echo 'Restarting application'
        sh "pm2 restart ${APP_NAME}"
    }
    error("Jenkins pipeline for ${APP_NAME}, successfully rollback.")
}

pipeline {
    agent {
        label(env.BRANCH_NAME == 'dev' ? 'frontEnd_beta' : 'frontEnd_node')
    }

    environment {
        PATH = "/usr/local/node-v22.11.0/bin:$PATH"
        branch = sh(returnStdout: true, script: 'git branch --show-current').trim()
    }

    options {
        // Skip waiting for input at other stages (assuming this applies to all stages)
        disableConcurrentBuilds(abortPrevious: true)
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: "${env.BRANCH_NAME}", credentialsId: 'ci-mekdep', url: 'https://github.com/mekdep/client-react'
            }
        }

        stage('Install&Build') {
            steps {
                script {
                    echo "BRANCH IS ${env.BRANCH_NAME}"
                    def APP_DIR = ""

                    switch (env.BRANCH_NAME) {
                        case "dev":
                            APP_DIR = '/var/www/beta/web'
                            InstallBuild(env.BRANCH_NAME, APP_DIR)
                            break
                        case "main":
                            APP_DIR = '/var/www/web'
                            InstallBuild(env.BRANCH_NAME, APP_DIR)
                            break
                        case "stable":
                            def regions = ['ahal', 'mary', 'dashoguz', 'lebap', 'balkan']
                            for (region in regions) {
                                OUT_DIR = "/home/akynyaz/codes/regions/${region}/build/"
                                APP_DIR = "/var/www/regions/${region}/web"
                                InstallBuild(env.BRANCH_NAME, APP_DIR)
                            }
                            break
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    switch (env.BRANCH_NAME) {
                        case "dev":
                            APP_NAME = 'beta'
                            echo "APP_NAME AND BRANCH_NAME: ${env.APP_NAME} ${env.BRANCH_NAME}}"
                            Deploy(env.BRANCH_NAME, APP_NAME)
                            break
                        case "main":
                            APP_NAME = 'web'
                            Deploy(env.BRANCH_NAME, APP_NAME)
                            break
                        case "stable":
                            def regions = ['ahal', 'mary', 'dashoguz', 'lebap', 'balkan']
                            for (region in regions) {
                                Deploy(env.BRANCH_NAME, region)
                            }
                            break
                    }
                }
            }
        }
    }
    post {
        success {
            script {
                switch(env.BRANCH_NAME) {
                        case "dev":
                            sshagent(credentials: ['sohbet_jenkins']) {
                                sh "supervisorctl start monitor_api"
                            }
                        case "stable":
                            sshagent(credentials: ['sohbet_jenkins']) {
                                sh "supervisorctl start monitor_api"
                                sh "ssh -p 9021 sohbet@192.168.1.110 'supervisorctl start monitor-api'"
                            }
                        case "main":
                            sshagent(credentials: ['sohbet_jenkins']) {
                                sh "supervisorctl start monitor_api"
                                sh "ssh -p 9021 sohbet@192.168.1.110 'supervisorctl start monitor-api'"
                            }
                        }
                    
                // Get current branch (commented out as unnecessary for notification)
                // def branch = sh(returnStdout: true, script: 'git branch --show-current').trim()
                echo "Current branch: ${env.BRANCH_NAME}"
                SCB = "branch: ${env.BRANCH_NAME}"

                // Check for last successful build existence
                def lastSuccessBuild = Jenkins.instance.getItemByFullName("${env.JOB_NAME}")?.lastSuccessfulBuild

                // Use optional chaining to handle null lastSuccessBuild
                def lastSuccessBuildTime = lastSuccessBuild?.getTimestamp()?.format('yyyy-MM-dd HH:mm:ss')
                echo "Last Successful Build Name: ${lastSuccessBuild}"
                LastSuccessName = "${lastSuccessBuild?.displayName ?: 'No Previous Success'}"
                LastSuccessTime = lastSuccessBuildTime ?: 'NA'

                echo "Test for branch ${env.BRANCH_NAME}"
            }

            // Mattermost notification for success
            mattermostSend(
                // Replace with your channel name
                message: " App build: '${env.JOB_NAME}' ${SCB} \n Status: **Success** [#${env.BUILD_NUMBER}](${env.BUILD_URL}/console)\n Last Successful Build id: [${LastSuccessName}](https://ci.mekdep.org/job/Multi_test/job/${env.BRANCH_NAME}/) time: [${LastSuccessTime}](https://ci.mekdep.org/job/Multi_test/job/${env.BRANCH_NAME}/lastSuccessfulBuild/)\n ChangeLog: [Link](https://ci.mekdep.org/job/Multi_test/job/${env.BRANCH_NAME})\n"
            )
        }

        failure {
            script {
                switch(env.BRANCH_NAME) {
                        case "dev":
                            sshagent(credentials: ['sohbet_jenkins']) {
                                sh "supervisorctl start monitor_api"
                            }
                        case "stable":
                            sshagent(credentials: ['sohbet_jenkins']) {
                                sh "supervisorctl start monitor_api"
                                sh "ssh -p 9021 sohbet@192.168.1.110 'supervisorctl start monitor-api'"
                            }
                        case "main":
                            sshagent(credentials: ['sohbet_jenkins']) {
                                sh "supervisorctl start monitor_api"
                                sh "ssh -p 9021 sohbet@192.168.1.110 'supervisorctl start monitor-api'"
                            }
                        }
                    
                // Get current branch (commented out as unnecessary for notification)
                // def branch = sh(returnStdout: true, script: 'git branch --show-current').trim()
                echo 'Current branch: {env.BUILD_NUMBER}'
                SCB = 'branch: {env.BUILD_NUMBER}'

                // Check for last successful build existence (same as success block)
                def lastSuccessBuild = Jenkins.instance.getItemByFullName("${env.JOB_NAME}")?.lastSuccessfulBuild
                def lastSuccessBuildTime = lastSuccessBuild?.getTimestamp()?.format('yyyy-MM-dd HH:mm:ss')
                echo "Last Successful Build Name: ${lastSuccessBuild}"
                LastSuccessName = "${lastSuccessBuild?.displayName ?: 'No Previous Success'}"
                LastSuccessTime = lastSuccessBuildTime ?: 'NA'

                echo "Test for branch ${env.BRANCH_NAME}"
            }

            // Mattermost notification for failure (same message structure as success)
            mattermostSend(
                color: '#FF0000',
                message: " App build: '${env.JOB_NAME}' ${SCB} \n Status: **Failed** [#${env.BUILD_NUMBER}](${env.BUILD_URL}/console)\n Last Successful Build id: [${LastSuccessName}](https://ci.mekdep.org/job/Multi_test/job/${env.BRANCH_NAME}/) time: [${LastSuccessTime}](https://ci.mekdep.org/job/Multi_test/job/${env.BRANCH_NAME}/lastSuccessfulBuild/)\n ChangeLog: [Link](https://ci.mekdep.org/job/Multi_test/job/${env.BRANCH_NAME})\n"
            )
        }
    }

}
