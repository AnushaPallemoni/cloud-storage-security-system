package com.cloudsec.repository;

import com.cloudsec.entity.FileShare;
import com.cloudsec.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FileShareRepository extends JpaRepository<FileShare, Long> {
    List<FileShare> findBySharedWithOrderBySharedAtDesc(User user);
    List<FileShare> findBySharedByOrderBySharedAtDesc(User user);
}
