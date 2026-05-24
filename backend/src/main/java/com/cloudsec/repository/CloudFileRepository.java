package com.cloudsec.repository;

import com.cloudsec.entity.CloudFile;
import com.cloudsec.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CloudFileRepository extends JpaRepository<CloudFile, Long> {
    List<CloudFile> findByOwnerOrderByUploadedAtDesc(User owner);
    List<CloudFile> findAllByOrderByUploadedAtDesc();
    List<CloudFile> findByIsSanitizedFalseOrderByUploadedAtDesc();
}
