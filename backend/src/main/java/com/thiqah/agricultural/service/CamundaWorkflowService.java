package com.thiqah.agricultural.service;

import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CamundaWorkflowService {

    @Autowired
    private RuntimeService runtimeService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private ApplicationService applicationService;

    private static final String PROCESS_KEY = "agricultural_record_renewal_process";

    public ProcessInstance startProcess(Long applicationId, String applicantId) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("applicationId", applicationId);
        variables.put("applicantId", applicantId);
        variables.put("lpSpecialist", "lp-specialist");
        variables.put("manager", "agriculture-manager");
        variables.put("coo", "coo");

        return runtimeService.startProcessInstanceByKey(PROCESS_KEY, applicationId.toString(), variables);
    }

    public List<Task> getTasksByAssignee(String assignee) {
        return taskService.createTaskQuery()
                .processDefinitionKey(PROCESS_KEY)
                .taskAssignee(assignee)
                .list();
    }

    public void completeTask(String taskId, String decision, String comment) {
        Task task = taskService.createTaskQuery()
                .taskId(taskId)
                .singleResult();

        if (task == null) {
            throw new IllegalArgumentException("Task not found: " + taskId);
        }

        // Get the application ID from the process variables
        String applicationId = (String) runtimeService.getVariable(task.getProcessInstanceId(), "applicationId");

        // Create variables for the task completion
        Map<String, Object> variables = new HashMap<>();
        variables.put("decision", decision);
        variables.put("comment", comment);

        // Complete the task
        taskService.complete(taskId, variables);

        // Update application status based on the decision
        updateApplicationStatus(Long.parseLong(applicationId), task.getTaskDefinitionKey(), decision);
    }

    private void updateApplicationStatus(Long applicationId, String taskKey, String decision) {
        String newStatus;

        switch (taskKey) {
            case "lp_specialist_review":
                if ("APPROVE".equals(decision)) {
                    newStatus = "APPROVED_BY_LP";
                } else if ("REJECT".equals(decision)) {
                    newStatus = "REJECTED_BY_LP";
                } else {
                    newStatus = "RETURNED_TO_APPLICANT";
                }
                break;

            case "manager_review":
                if ("APPROVE".equals(decision)) {
                    newStatus = "APPROVED_BY_AGRICULTURE";
                } else if ("REJECT".equals(decision)) {
                    newStatus = "REJECTED_BY_AGRICULTURE";
                } else {
                    newStatus = "RETURNED_TO_LP";
                }
                break;

            case "coo_review":
                if ("APPROVE".equals(decision)) {
                    newStatus = "APPROVED";
                } else if ("REJECT".equals(decision)) {
                    newStatus = "REJECTED";
                } else {
                    newStatus = "RETURNED_TO_AGRICULTURE";
                }
                break;

            default:
                return;
        }

        applicationService.updateStatus(applicationId, newStatus);
    }

    public Task getCurrentTask(String processInstanceId) {
        return taskService.createTaskQuery()
                .processInstanceId(processInstanceId)
                .singleResult();
    }

    public void addComment(String taskId, String userId, String message) {
        taskService.createComment(taskId, null, message);
    }

    public List<Task> getTasksByApplicationId(Long applicationId) {
        return taskService.createTaskQuery()
                .processInstanceBusinessKey(applicationId.toString())
                .list();
    }
}