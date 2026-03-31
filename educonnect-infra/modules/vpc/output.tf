output "worker-subnet-ids" {
  value = [
    aws_subnet.worker-private-subnet-1.id,
    aws_subnet.worker-private-subnet-2.id
  ]
}

output "vpc_id" {
  value = aws_vpc.eks-vpc.id
}

output "rds-subnet-ids" {
  value = [
    aws_subnet.rds-private-subnet-1.id,
    aws_subnet.rds-private-subnet-2.id
  ]
}