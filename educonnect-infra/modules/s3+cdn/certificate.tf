data "aws_acm_certificate" "my_cert" {
  domain = "*.viraldobariya.me"
  most_recent = true
  statuses = ["ISSUED"]
}