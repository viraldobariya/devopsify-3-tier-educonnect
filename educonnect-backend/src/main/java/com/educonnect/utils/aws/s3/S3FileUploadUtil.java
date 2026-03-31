package com.educonnect.utils.aws.s3;


import com.educonnect.exceptionhandling.exception.FileIsNotImageException;
import com.educonnect.exceptionhandling.exception.FileSizeExceeded;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class S3FileUploadUtil {

    private final String bucketName = "educonnect-java-bucket";

    private final S3Client s3Client;

    private final static List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"
    );

    @Autowired
    public S3FileUploadUtil(S3Client s3Client){
        this.s3Client = s3Client;
    }

    public String uploadImage(MultipartFile file) throws IOException {
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())){
            throw new FileIsNotImageException("File is not image file.");
        }

        String fileName = UUID.randomUUID().toString();

        PutObjectRequest request = PutObjectRequest
                .builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();
        s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, Region.US_EAST_1.id(), fileName);
    }

    public String uploadFile(MultipartFile file) throws IOException {

        if (file.getSize() > 1024 * 1024 * 5){
            throw new FileSizeExceeded("File can't be larger than 5MB.");
        }

        String fileName = UUID.randomUUID().toString();

        PutObjectRequest request = PutObjectRequest
                .builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();
        s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, Region.US_EAST_1.id(), fileName);
    }

}
