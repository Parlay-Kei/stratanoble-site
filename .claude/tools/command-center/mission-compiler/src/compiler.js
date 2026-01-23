/**
 * Mission Compiler V1
 * Converts directives into deterministic job graphs
 */

const { v4: uuidv4 } = require('uuid');

class MissionCompilerV1 {
  constructor() {
    this.version = 'v1';
    this.supportedIntents = ['validate', 'test', 'build', 'deploy', 'analyze'];
    this.supportedScopes = ['all', 'repository', 'service', 'component'];
  }

  /**
   * Compile a directive into a job graph
   * @param {Object} directive - The directive to compile
   * @returns {Object} Job graph with dependencies
   */
  compile(directive) {
    const { title, body, scope, intent } = directive;

    // Parse directive body for specific instructions
    const instructions = this.parseDirectiveBody(body);

    // Generate job graph based on intent and scope
    const jobGraph = this.generateJobGraph(intent, scope, instructions);

    // Add metadata
    jobGraph.metadata = {
      compiler_version: this.version,
      directive_id: directive.id,
      directive_title: title,
      compiled_at: new Date().toISOString(),
      total_jobs: jobGraph.jobs.length,
      has_dependencies: jobGraph.dependencies.length > 0
    };

    return jobGraph;
  }

  parseDirectiveBody(body) {
    const instructions = {
      repositories: [],
      operations: [],
      constraints: [],
      deliverables: [],
      tasks: []
    };

    // Extract repositories mentioned
    const repoPattern = /(?:DirectCuts-iOS|DSLV|StrataNoble|msaudreys-house)/gi;
    const repoMatches = body.match(repoPattern);
    if (repoMatches) {
      instructions.repositories = [...new Set(repoMatches)];
    }

    // Extract operations (validate, test, build, etc.)
    const opPattern = /\b(validate|test|build|deploy|analyze|sweep|check)\b/gi;
    const opMatches = body.match(opPattern);
    if (opMatches) {
      instructions.operations = [...new Set(opMatches.map(op => op.toLowerCase()))];
    }

    // Extract tasks (numbered or bulleted lists)
    const taskPattern = /(?:\d+\)|[-*])\s+([^\n]+)/g;
    let taskMatch;
    while ((taskMatch = taskPattern.exec(body)) !== null) {
      instructions.tasks.push(taskMatch[1].trim());
    }

    // Extract constraints
    const constraintPattern = /constraint[s]?:\s*([^\n]+)/gi;
    let constraintMatch;
    while ((constraintMatch = constraintPattern.exec(body)) !== null) {
      instructions.constraints.push(constraintMatch[1].trim());
    }

    // Extract deliverables
    const deliverablePattern = /deliverable[s]?:\s*([^\n]+)/gi;
    let deliverableMatch;
    while ((deliverableMatch = deliverablePattern.exec(body)) !== null) {
      instructions.deliverables.push(deliverableMatch[1].trim());
    }

    return instructions;
  }

  generateJobGraph(intent, scope, instructions) {
    const jobs = [];
    const dependencies = [];

    // Generate jobs based on intent
    switch (intent) {
      case 'validate':
        jobs.push(...this.generateValidationJobs(scope, instructions));
        break;
      case 'test':
        jobs.push(...this.generateTestJobs(scope, instructions));
        break;
      case 'build':
        jobs.push(...this.generateBuildJobs(scope, instructions));
        break;
      case 'deploy':
        jobs.push(...this.generateDeploymentJobs(scope, instructions));
        break;
      case 'analyze':
        jobs.push(...this.generateAnalysisJobs(scope, instructions));
        break;
      default:
        jobs.push(...this.generateGenericJobs(scope, instructions));
    }

    // Generate dependencies if multiple phases
    if (jobs.length > 1) {
      dependencies.push(...this.generateDependencies(jobs));
    }

    return {
      jobs,
      dependencies,
      execution_strategy: this.determineExecutionStrategy(jobs)
    };
  }

  generateValidationJobs(scope, instructions) {
    const jobs = [];
    const repos = instructions.repositories.length > 0
      ? instructions.repositories
      : ['DirectCuts-iOS', 'DSLV', 'StrataNoble', 'msaudreys-house'];

    if (scope === 'all' || scope === 'repository') {
      repos.forEach(repo => {
        jobs.push({
          id: uuidv4(),
          name: `validate_${repo.toLowerCase().replace('-', '_')}`,
          type: 'validate',
          owner: 'engineering',
          target: repo,
          command: {
            service: 'project_op_adapter_v3',
            operation: 'validate',
            repo_id: repo
          },
          proof_required: true,
          proof_type: 'validation_receipt',
          timeout: 300,
          retries: 1,
          status: 'pending'
        });
      });
    }

    // Add preflight check job
    if (jobs.length > 0) {
      const preflightJob = {
        id: uuidv4(),
        name: 'preflight_checks',
        type: 'preflight',
        owner: 'devops',
        command: {
          service: 'preflight_validator',
          operation: 'check_environment'
        },
        proof_required: true,
        proof_type: 'preflight_receipt',
        timeout: 60,
        retries: 0,
        status: 'pending'
      };
      jobs.unshift(preflightJob);
    }

    return jobs;
  }

  generateTestJobs(scope, instructions) {
    const jobs = [];
    const repos = instructions.repositories.length > 0
      ? instructions.repositories
      : ['DSLV', 'StrataNoble'];

    repos.forEach(repo => {
      jobs.push({
        id: uuidv4(),
        name: `test_${repo.toLowerCase().replace('-', '_')}`,
        type: 'test',
        owner: 'qa',
        target: repo,
        command: {
          service: 'test_runner',
          operation: 'run_tests',
          repo_id: repo,
          test_type: 'unit'
        },
        proof_required: true,
        proof_type: 'test_report',
        timeout: 600,
        retries: 2,
        status: 'pending'
      });
    });

    return jobs;
  }

  generateBuildJobs(scope, instructions) {
    const jobs = [];
    const repos = instructions.repositories.length > 0
      ? instructions.repositories
      : ['DSLV', 'StrataNoble'];

    repos.forEach(repo => {
      jobs.push({
        id: uuidv4(),
        name: `build_${repo.toLowerCase().replace('-', '_')}`,
        type: 'build',
        owner: 'engineering',
        target: repo,
        command: {
          service: 'build_service',
          operation: 'build',
          repo_id: repo,
          build_type: 'production'
        },
        proof_required: true,
        proof_type: 'build_artifact',
        timeout: 900,
        retries: 1,
        status: 'pending'
      });
    });

    return jobs;
  }

  generateDeploymentJobs(scope, instructions) {
    const jobs = [];

    // Add safety checks for deployment
    jobs.push({
      id: uuidv4(),
      name: 'deployment_safety_check',
      type: 'safety_check',
      owner: 'devops',
      command: {
        service: 'deployment_guardian',
        operation: 'verify_safe_to_deploy'
      },
      proof_required: true,
      proof_type: 'safety_receipt',
      timeout: 120,
      retries: 0,
      status: 'pending'
    });

    // Add actual deployment job
    jobs.push({
      id: uuidv4(),
      name: 'deploy_to_production',
      type: 'deploy',
      owner: 'devops',
      command: {
        service: 'deployment_service',
        operation: 'deploy',
        environment: 'production'
      },
      proof_required: true,
      proof_type: 'deployment_receipt',
      timeout: 1800,
      retries: 0,
      status: 'pending'
    });

    return jobs;
  }

  generateAnalysisJobs(scope, instructions) {
    const jobs = [];

    // Generate analysis jobs based on instructions
    if (instructions.tasks.length > 0) {
      instructions.tasks.forEach((task, index) => {
        jobs.push({
          id: uuidv4(),
          name: `analyze_task_${index + 1}`,
          type: 'analysis',
          owner: 'analytics',
          description: task,
          command: {
            service: 'analysis_engine',
            operation: 'analyze',
            task: task
          },
          proof_required: true,
          proof_type: 'analysis_report',
          timeout: 600,
          retries: 1,
          status: 'pending'
        });
      });
    } else {
      // Default analysis job
      jobs.push({
        id: uuidv4(),
        name: 'general_analysis',
        type: 'analysis',
        owner: 'analytics',
        command: {
          service: 'analysis_engine',
          operation: 'analyze',
          scope: scope
        },
        proof_required: true,
        proof_type: 'analysis_report',
        timeout: 600,
        retries: 1,
        status: 'pending'
      });
    }

    return jobs;
  }

  generateGenericJobs(scope, instructions) {
    const jobs = [];

    // Generate jobs from parsed tasks
    instructions.tasks.forEach((task, index) => {
      jobs.push({
        id: uuidv4(),
        name: `task_${index + 1}`,
        type: 'generic',
        owner: 'ops',
        description: task,
        command: {
          service: 'task_executor',
          operation: 'execute',
          task: task
        },
        proof_required: true,
        proof_type: 'task_receipt',
        timeout: 300,
        retries: 1,
        status: 'pending'
      });
    });

    // If no specific tasks, create a placeholder job
    if (jobs.length === 0) {
      jobs.push({
        id: uuidv4(),
        name: 'placeholder_job',
        type: 'generic',
        owner: 'ops',
        command: {
          service: 'noop_service',
          operation: 'noop'
        },
        proof_required: false,
        timeout: 10,
        retries: 0,
        status: 'pending'
      });
    }

    return jobs;
  }

  generateDependencies(jobs) {
    const dependencies = [];

    // Create linear dependencies for now (job n depends on job n-1)
    // In a real system, this would be more sophisticated
    for (let i = 1; i < jobs.length; i++) {
      // Preflight must complete before anything else
      if (jobs[0].type === 'preflight') {
        dependencies.push({
          from: jobs[0].id,
          to: jobs[i].id,
          type: 'required'
        });
      }

      // Safety checks must complete before deployments
      const safetyCheck = jobs.find(j => j.type === 'safety_check');
      const deployJob = jobs.find(j => j.type === 'deploy');
      if (safetyCheck && deployJob) {
        dependencies.push({
          from: safetyCheck.id,
          to: deployJob.id,
          type: 'required'
        });
      }
    }

    return dependencies;
  }

  determineExecutionStrategy(jobs) {
    // Determine if jobs can run in parallel or must be sequential
    const hasDeployment = jobs.some(j => j.type === 'deploy');
    const hasSafetyCheck = jobs.some(j => j.type === 'safety_check');

    if (hasDeployment || hasSafetyCheck) {
      return 'sequential'; // Safety first for deployments
    }

    const uniqueRepos = new Set(jobs.map(j => j.target).filter(Boolean));
    if (uniqueRepos.size > 1) {
      return 'parallel'; // Different repos can run in parallel
    }

    return 'sequential'; // Default to sequential
  }

  /**
   * Sign the plan for auditability
   */
  signPlan(plan) {
    const crypto = require('crypto');
    const planString = JSON.stringify(plan);
    const hash = crypto.createHash('sha256').update(planString).digest('hex');

    return {
      ...plan,
      signature: {
        hash,
        compiler_version: this.version,
        signed_at: new Date().toISOString(),
        signed_by: 'mission_compiler_v1'
      }
    };
  }
}

module.exports = MissionCompilerV1;