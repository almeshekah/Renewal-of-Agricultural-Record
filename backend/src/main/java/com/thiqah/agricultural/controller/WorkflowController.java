package com.thiqah.agricultural.controller;

import com.thiqah.agricultural.service.CamundaWorkflowService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workflow")
@CrossOrigin(origins = "*")
public class WorkflowController {

    @Autowired
    private CamundaWorkflowService workflowService;

    @PostMapping("/start/{applicationId}")
    public ResponseEntity<String> startWorkflow(
            @PathVariable Long applicationId,
            @RequestParam String applicantId) {
        ProcessInstance processInstance = workflowService.startProcess(applicationId, applicantId);
        return ResponseEntity.ok(processInstance.getId());
    }

    @GetMapping("/tasks/{assignee}")
    public ResponseEntity<List<Task>> getTasksByAssignee(@PathVariable String assignee) {
        List<Task> tasks = workflowService.getTasksByAssignee(assignee);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<Void> completeTask(
            @PathVariable String taskId,
            @RequestBody Map<String, String> payload) {
        String decision = payload.get("decision");
        String comment = payload.get("comment");
        workflowService.completeTask(taskId, decision, comment);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/tasks/application/{applicationId}")
    public ResponseEntity<List<Task>> getTasksByApplicationId(@PathVariable Long applicationId) {
        List<Task> tasks = workflowService.getTasksByApplicationId(applicationId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/tasks/current/{processInstanceId}")
    public ResponseEntity<Task> getCurrentTask(@PathVariable String processInstanceId) {
        Task task = workflowService.getCurrentTask(processInstanceId);
        return ResponseEntity.ok(task);
    }

    @PostMapping("/tasks/{taskId}/comment")
    public ResponseEntity<Void> addComment(
            @PathVariable String taskId,
            @RequestParam String userId,
            @RequestBody String message) {
        workflowService.addComment(taskId, userId, message);
        return ResponseEntity.ok().build();
    }
}