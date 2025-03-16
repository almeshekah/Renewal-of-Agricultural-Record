package com.thiqah.agricultural.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private CamundaWorkflowService workflowService;

    @PostMapping("/submit")
    public ResponseEntity<Application> submitApplication(@RequestBody Application application) {
        // Save the application first
        Application savedApplication = applicationService.saveApplication(application);

        // Start the workflow process
        ProcessInstance processInstance = workflowService.startProcess(
                savedApplication.getId(),
                savedApplication.getApplicant().getId().toString());

        // Update the application with the process instance ID
        savedApplication.setProcessInstanceId(processInstance.getId());
        applicationService.saveApplication(savedApplication);

        return ResponseEntity.ok(savedApplication);
    }
}