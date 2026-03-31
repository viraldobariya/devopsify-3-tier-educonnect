variable "vpc_cidr" {
  default = "10.0.0.0/16"
  type = string
}

variable "public-1-cidr" {
  default = "10.0.1.0/24"
  type = string
}

variable "public-2-cidr" {
  default = "10.0.2.0/24"
  type = string
}

variable "worker-1-cidr" {
  default = "10.0.100.0/24"
  type = string
}

variable "worker-2-cidr" {
  default = "10.0.101.0/24"
  type = string
}

variable "rds-1-cidr" {
  default = "10.0.150.0/24"
  type = string
}

variable "rds-2-cidr" {
  default = "10.0.151.0/24"
  type = string
}