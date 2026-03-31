resource "aws_subnet" "public-subnet-1" {
  vpc_id = aws_vpc.eks-vpc.id
  cidr_block = var.public-1-cidr
  availability_zone = data.aws_availability_zones.available.names[0]
  tags = {
    "kubernetes.io/role/elb" = "1"
  }
}

resource "aws_subnet" "public-subnet-2" {
  vpc_id = aws_vpc.eks-vpc.id
  cidr_block = var.public-2-cidr
  availability_zone = data.aws_availability_zones.available.names[1]
  tags = {
    "kubernetes.io/role/elb" = "1"
  }
}

resource "aws_route_table" "public-rt" {
  vpc_id = aws_vpc.eks-vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.eks-igw.id
  }

  tags = {
    Name = "public-rt"
  }
}

resource "aws_route_table_association" "public-rta-1" {
  route_table_id = aws_route_table.public-rt.id
  subnet_id = aws_subnet.public-subnet-1.id
}

resource "aws_route_table_association" "public-rta-2" {
  route_table_id = aws_route_table.public-rt.id
  subnet_id = aws_subnet.public-subnet-2.id
}