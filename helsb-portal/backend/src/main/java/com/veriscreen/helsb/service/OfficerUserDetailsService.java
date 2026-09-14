package com.veriscreen.helsb.service;

import com.veriscreen.helsb.entity.HelsbOfficer;
import com.veriscreen.helsb.repository.HelsbOfficerRepository;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class OfficerUserDetailsService implements UserDetailsService {

    private final HelsbOfficerRepository officerRepository;

    public OfficerUserDetailsService(HelsbOfficerRepository officerRepository) {
        this.officerRepository = officerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String lookup = username == null ? "" : username.trim().toLowerCase();
        HelsbOfficer officer = officerRepository.findByUsername(lookup)
                .or(() -> officerRepository.findByUsernameIgnoreCase(lookup))
                .orElseThrow(() -> new UsernameNotFoundException("Officer not found"));
        return new User(
                officer.getUsername(),
                officer.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + officer.getRole())));
    }
}
