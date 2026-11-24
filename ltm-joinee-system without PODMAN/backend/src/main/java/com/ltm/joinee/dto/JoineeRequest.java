package com.ltm.joinee.dto;

import jakarta.validation.constraints.NotBlank;

/** Data sent by React in the POST request body. */
public class JoineeRequest {

    @NotBlank(message = "Joinee name is required")
    private String joineeName;

    @NotBlank(message = "PS ID is required")
    private String psId;

    @NotBlank(message = "Project ID is required")
    private String projectId;

    @NotBlank(message = "Project name is required")
    private String projectName;

    public String getJoineeName() { return joineeName; }
    public void setJoineeName(String joineeName) { this.joineeName = joineeName; }
    public String getPsId() { return psId; }
    public void setPsId(String psId) { this.psId = psId; }
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
}
