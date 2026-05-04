resource "aws_cloudfront_origin_access_control" "default-oac" {
  name = "default-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior = "always"
  signing_protocol = "sigv4"
}

resource "aws_cloudfront_distribution" "edu-frontend-cdn" {
  origin {
    origin_id = "static-s3"
    domain_name = aws_s3_bucket.frontend_static_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.default-oac.id
  }

  aliases = ["educonnect.viraldobariya.me"]

  enabled = true
  is_ipv6_enabled = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = "static-s3"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl = 0
    default_ttl = 3600
    max_ttl = 86400
    compress = true
  }

  price_class = "PriceClass_All"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  custom_error_response {
    error_code = 403
    error_caching_min_ttl = 60
    response_code = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code = 404
    error_caching_min_ttl = 60
    response_code = 200
    response_page_path = "/index.html"
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.my_cert.arn
    ssl_support_method = "sni-only"
  }

  
}