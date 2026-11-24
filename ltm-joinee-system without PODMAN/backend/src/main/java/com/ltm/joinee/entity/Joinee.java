package com.ltm.joinee.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "joinees")
public class Joinee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String joineeName;

    @Column(unique = true, nullable = false)   // PS ID must be unique
    private String psId;

    private String projectId;
    private String projectName;

    public Long getId() { return id; }
    public String getJoineeName() { return joineeName; }
    public void setJoineeName(String joineeName) { this.joineeName = joineeName; }
    public String getPsId() { return psId; }
    public void setPsId(String psId) { this.psId = psId; }
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
}
