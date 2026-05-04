package com.educonnect.user.service;


import com.educonnect.auth.dto.request.CheckRequest;
import com.educonnect.auth.dto.response.CheckResponse;
import com.educonnect.auth.service.AuthService;
import com.educonnect.connection.dto.general.SuggestDTO;
import com.educonnect.connection.repository.ConnectionRepository;
import com.educonnect.connection.service.ConnectionService;
import com.educonnect.exceptionhandling.exception.BusinessRuleViolationException;
import com.educonnect.exceptionhandling.exception.FileUploadException;
import com.educonnect.exceptionhandling.exception.InvalidCredentialsException;
import com.educonnect.user.dto.request.SearchRequest;
import com.educonnect.user.dto.response.FindResponse;
import com.educonnect.user.entity.Users;
import com.educonnect.user.repository.UserRepository;
import com.educonnect.utils.aws.s3.S3FileUploadUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final AuthService authService;

    private final S3FileUploadUtil s3FileUploadUtil;

    private final ConnectionRepository connectionRepository;


    private final ConnectionService connectionService;

    @Autowired
    public UserService(UserRepository userRepository, AuthService authService, S3FileUploadUtil s3FileUploadUtil, ConnectionRepository connectionRepository, ConnectionService connectionService){
        this.userRepository = userRepository;
        this.authService = authService;
        this.s3FileUploadUtil = s3FileUploadUtil;
        this.connectionRepository = connectionRepository;
        this.connectionService = connectionService;
    }

    public List<SuggestDTO> suggest(HttpServletRequest request, HttpServletResponse response){
        Users user = authService.me(request, response);

        List<Users> candidates = userRepository.suggest(user.getId());

        Collections.shuffle(candidates);

        List<Users> filtered = new ArrayList<>(candidates.stream()
                .filter(candet -> candet.getUniversity().equals(user.getUniversity())
                        || candet.getCourse().equals(user.getCourse())
                        && !Collections.disjoint(candet.getSkills(), user.getSkills()))
                .limit(12)
                .toList());

        Set<UUID> seenUsers = filtered.stream().map(u -> u.getId()).collect(Collectors.toSet());

        filtered.addAll(candidates.stream()
                .filter(u -> !seenUsers.contains(u.getId()))
                        .limit(20 - filtered.size())
                .collect(Collectors.toList()));

        List<SuggestDTO> res = filtered.stream().map(
                u -> new SuggestDTO(u, connectionService.getStatusById(request, response, u.getId()))
        ).toList();

        System.out.println(res);

        return res;
    }

    public FindResponse find(String username){
        System.out.println(username);
        Users user = userRepository.findByUsername(username);

        if (user==null){
            throw new InvalidCredentialsException("Username does not found.");
        }

        return new FindResponse(user);
    }

    public Users update(Users user, MultipartFile file){
        System.out.println(user.toString());
        if (user.getId() == null || user.getUsername() == null || user.getEmail() == null || user.getFullName() == null || user.getUniversity() == null || user.getCourse() == null || user.getPassword() == null){
            throw new BusinessRuleViolationException("Null value exception");
        }

        Users newUser = Users.builder()
                .username(user.getUsername())
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .bio((user.getBio()))
                .role(user.getRole())
                .linkedin(user.getLinkedin())
                .github(user.getGithub())
                .password(user.getPassword())
                .university(user.getUniversity())
                .course(user.getCourse())
                .skills(user.getSkills())
                .createdAt(user.getCreatedAt())
                .build();


        if (file!=null && file.getContentType() != null && file.getContentType().startsWith("image/")){
            String avatar;
            try{
                avatar = s3FileUploadUtil.uploadImage(file);
            }
            catch(Exception e){
                throw new FileUploadException("S3 file upload exception");
            }
            newUser.setAvatar(avatar);
        }
        else{
            newUser.setAvatar(user.getAvatar());
        }

        return userRepository.save(newUser);
    }

    public CheckResponse checkUpdate(HttpServletRequest request, HttpServletResponse response, CheckRequest requestData){
        if (requestData.getUsername() == null || requestData.getEmail() == null){
            throw new BusinessRuleViolationException("Null attributes provided.");
        }

        Users user = authService.me(request, response);

        return new CheckResponse(userRepository.checkUpdate(requestData.getUsername(), requestData.getEmail(), user.getUsername(), user.getEmail()) == 0);
    }

    public Page<SuggestDTO> search(HttpServletRequest servletRequest, HttpServletResponse response,  SearchRequest request){
        Users currentUser = authService.me(servletRequest, response);
        String search = request.getSearch() == null ? "" : request.getSearch();

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        Page<UUID> users = userRepository.searchUserIds(request.getSearch(), request.getUniversity(), request.getCourse(), request.getSkills(), pageable);

        List<Users> tempUsers = userRepository.findByIdIn(users.getContent());

        Page<Users> resUsers = new PageImpl<>(tempUsers, pageable, users.getTotalElements());

        List<SuggestDTO> suggests =  resUsers.stream().map(user -> new SuggestDTO(user, connectionService.getStatusById(servletRequest, response, user.getId()))).toList();
        return  new PageImpl<>(suggests, pageable, users.getTotalElements());
    }

    public List<Users> findByUsername(String search){
        if (search == null || search.equals("")){
            throw new BusinessRuleViolationException("username not given.");
        }
        List<Users> users = userRepository.searchByUsername(search);
        return users;
    }

    public List<Users> chatUsers(Users user){
        List<Users> users = userRepository.getChatUsers(user.getId());
        return users;
    }

    public Users findById(UUID id){
        return userRepository.findById(id).orElseThrow(() -> new InvalidCredentialsException("User not found with given id."));
    }

    /**
     * Stub method to simulate fetching group members by group name.
     * Replace with actual implementation when available.
     */
    public List<FindResponse> findGroupMembers(String groupName) {
        // TODO: Replace with actual group member fetching logic
        // For now, return an empty list or mock data
        return new ArrayList<>();
    }
}
