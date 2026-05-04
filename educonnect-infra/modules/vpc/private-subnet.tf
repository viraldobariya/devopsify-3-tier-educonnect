resource "aws_subnet" "worker-private-subnet-1" {
  vpc_id = aws_vpc.eks-vpc.id
  cidr_block = var.worker-1-cidr
  availability_zone = data.aws_availability_zones.available.names[0]
}

resource "aws_subnet" "worker-private-subnet-2" {
  vpc_id = aws_vpc.eks-vpc.id
  cidr_block = var.worker-2-cidr
  availability_zone = data.aws_availability_zones.available.names[1]
}

resource "aws_subnet" "rds-private-subnet-1" {
  vpc_id = aws_vpc.eks-vpc.id
  cidr_block = var.rds-1-cidr
  availability_zone = data.aws_availability_zones.available.names[0]
}

resource "aws_subnet" "rds-private-subnet-2" {
  vpc_id = aws_vpc.eks-vpc.id
  cidr_block = var.rds-2-cidr
  availability_zone = data.aws_availability_zones.available.names[1]
}


resource "aws_route_table" "private-rt" {
  vpc_id = aws_vpc.eks-vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.eks-natgw.id
  }

  tags = {
    Name = "private-rt"
  }
}


resource "aws_route_table_association" "rta-worker-1" {
  route_table_id = aws_route_table.private-rt.id
  subnet_id = aws_subnet.worker-private-subnet-1.id
}

resource "aws_route_table_association" "rta-worker-2" {
  route_table_id = aws_route_table.private-rt.id
  subnet_id = aws_subnet.worker-private-subnet-2.id
}

resource "aws_route_table_association" "rta-rds-1" {
  route_table_id = aws_route_table.private-rt.id
  subnet_id = aws_subnet.rds-private-subnet-1.id
}

resource "aws_route_table_association" "rta-rds-2" {
  route_table_id = aws_route_table.private-rt.id
  subnet_id = aws_subnet.rds-private-subnet-2.id
}