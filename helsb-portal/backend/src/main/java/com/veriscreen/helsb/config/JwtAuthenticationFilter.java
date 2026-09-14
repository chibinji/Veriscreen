package com.veriscreen.helsb.config;

import com.veriscreen.helsb.service.JwtService;
import com.veriscreen.helsb.service.OfficerUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final OfficerUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, OfficerUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        String token = header.substring(7);
        try {
            String username = jwtService.extractUsername(token);
            if (username != null
                    && SecurityContextHolder.getContext().getAuthentication() == null
                    && jwtService.validateToken(token)) {
                UserDetails details = userDetailsService.loadUserByUsername(username);
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities()));
            }
        } catch (Exception ignored) {
            // unauthenticated
        }
        chain.doFilter(request, response);
    }
}
