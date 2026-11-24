package com.ltm.joinee.controller;

import com.ltm.joinee.dto.JoineeRequest;
import com.ltm.joinee.entity.Joinee;
import com.ltm.joinee.service.JoineeService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/joinees")
public class JoineeController {

    private static final Logger log = LoggerFactory.getLogger(JoineeController.class);

    private final JoineeService service;

    public JoineeController(JoineeService service) {
        this.service = service;
    }

    // React -> POST /api/joinees  ->  201 + saved joinee (or 400 / 409)
    @PostMapping
    public ResponseEntity<Joinee> register(@Valid @RequestBody JoineeRequest request) {
        log.info("POST /api/joinees received: psId={}", request.getPsId());
        Joinee saved = service.register(request);
        log.info("Saved joinee psId={} and sending 201 response", saved.getPsId());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // React -> GET /api/joinees/{psId}  ->  200 + joinee (or 404)
    @GetMapping("/{psId}")
    public Joinee getByPsId(@PathVariable String psId) {
        log.info("GET /api/joinees/{} received", psId);
        Joinee found = service.findByPsId(psId);
        log.info("Found joinee psId={} and sending 200 response", psId);
        return found;
    }
}
