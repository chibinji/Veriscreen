package com.veriscreen.helsb.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class InboundApiKeyFilter extends OncePerRequestFilter {

    private final String apiKey;

    public InboundApiKeyFilter(@Value("${helsb.inbound-api-key}") String apiKey) {
        this.apiKey = apiKey;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/v1/inbound/") || path.equals("/api/v1/inbound/health");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain) throws ServletException, IOException {
        String provided = request.getHeader("X-API-Key");
        if (provided == null || !MessageDigest.isEqual(
                provided.getBytes(StandardCharsets.UTF_8), apiKey.getBytes(StandardCharsets.UTF_8))) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"status\":401,\"message\":\"Valid HELSB API key required\"}");
            return;
        }
        AbstractAuthenticationToken authentication = new AbstractAuthenticationToken(
                AuthorityUtils.createAuthorityList("ROLE_VERISCREEN")) {
            @Override
            public Object getCredentials() {
                return "N/A";
            }

            @Override
            public Object getPrincipal() {
                return "veriscreen";
            }
        };
        authentication.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        chain.doFilter(request, response);
    }
}
