package com.ltm.joinee.service;

import com.ltm.joinee.dto.JoineeRequest;
import com.ltm.joinee.entity.Joinee;
import com.ltm.joinee.exception.ApiException;
import com.ltm.joinee.repository.JoineeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class JoineeService {

    private final JoineeRepository repository;

    public JoineeService(JoineeRepository repository) {
        this.repository = repository;
    }

    public Joinee register(JoineeRequest request) {
        String psId = request.getPsId().trim();

        if (repository.existsByPsId(psId)) {
            throw new ApiException(HttpStatus.CONFLICT, "PS ID " + psId + " is already registered");
        }

        Joinee joinee = new Joinee();
        joinee.setJoineeName(request.getJoineeName().trim());
        joinee.setPsId(psId);
        joinee.setProjectId(request.getProjectId().trim());
        joinee.setProjectName(request.getProjectName().trim());
        return repository.save(joinee);
    }

    public Joinee findByPsId(String psId) {
        return repository.findByPsId(psId.trim())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No joinee found with PS ID " + psId));
    }
}
