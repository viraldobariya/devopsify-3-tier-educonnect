variable "oidc_url" {
  type = string
}

variable "oidc_arn" {
  type = string
}

variable "backend_bucket_name" {
  default = "backend-static-content-270322347"
  type = string
}

variable "region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "cluster_name" {
  type = string
}