package com.educonnect.auth.service;

import com.educonnect.auth.security.UserDetailsImpl;
import com.educonnect.user.entity.Users;
import com.educonnect.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private UserRepository userRepository;

    @Autowired
    public UserDetailsServiceImpl(UserRepository userRepository){
        this.userRepository = userRepository;
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user = userRepository.findByUsername(username);


        if (user==null)
            throw new UsernameNotFoundException("Username not found inside UserDetailsService");

        UserDetails userDetails = new UserDetailsImpl(user);

        return userDetails;
    }
}
