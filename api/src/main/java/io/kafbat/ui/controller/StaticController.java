package io.kafbat.ui.controller;

import io.kafbat.ui.util.ResourceUtil;
import java.util.concurrent.atomic.AtomicReference;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class StaticController {

  @Value("classpath:static/index.html")
  private Resource indexFile;
  @Value("classpath:static/manifest.json")
  private Resource manifestFile;
  @Value("${REACT_APP_SUPPORT_URL:}")
  private String supportUrl;

  private final AtomicReference<String> renderedIndexFile = new AtomicReference<>();
  private final AtomicReference<String> renderedManifestFile = new AtomicReference<>();

  @GetMapping(value = "/index.html", produces = {"text/html"})
  public Mono<ResponseEntity<String>> getIndex(ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(getRenderedFile(exchange, renderedIndexFile, indexFile)));
  }

  @GetMapping(value = "/manifest.json", produces = {"application/json"})
  public Mono<ResponseEntity<String>> getManifest(ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(getRenderedFile(exchange, renderedManifestFile, manifestFile)));
  }

  public String getRenderedFile(ServerWebExchange exchange, AtomicReference<String> renderedFile, Resource file) {
    String rendered = renderedFile.get();
    if (rendered == null) {
      rendered = buildFile(file, exchange.getRequest().getPath().contextPath().value());
      if (renderedFile.compareAndSet(null, rendered)) {
        return rendered;
      } else {
        return renderedFile.get();
      }
    } else {
      return rendered;
    }
  }

  @SneakyThrows
  private String buildFile(Resource file, String contextPath) {
    return ResourceUtil.readAsString(file)
        .replace("\"assets/", "\"" + contextPath + "/assets/")
        .replace("PUBLIC-PATH-VARIABLE", contextPath)
        .replace("ENV_CONFIG_PLACEHOLDER", buildEnvConfig());
  }

  private String buildEnvConfig() {
    if (!StringUtils.hasText(supportUrl)) {
      return "undefined";
    }
    return "{\"REACT_APP_SUPPORT_URL\":\"" + supportUrl.replace("\"", "\\\"") + "\"}";
  }
}
