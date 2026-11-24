package com.ltm.joinee.repository;

import com.ltm.joinee.entity.Joinee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JoineeRepository extends JpaRepository<Joinee, Long> {

    Optional<Joinee> findByPsId(String psId);

    boolean existsByPsId(String psId);
}
