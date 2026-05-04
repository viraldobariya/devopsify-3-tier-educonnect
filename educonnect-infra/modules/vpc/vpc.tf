resource "aws_vpc" "eks-vpc" {
  cidr_block = var.vpc_cidr

  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "eks-vpc"
  }
}

resource "aws_internet_gateway" "eks-igw" {
  vpc_id = aws_vpc.eks-vpc.id
}

resource "aws_eip" "nat-eip" {
  domain = "vpc"
}

resource "aws_nat_gateway" "eks-natgw" {
  allocation_id = aws_eip.nat-eip.id
  subnet_id = aws_subnet.public-subnet-1.id
  depends_on = [
    aws_internet_gateway.eks-igw
  ]
}