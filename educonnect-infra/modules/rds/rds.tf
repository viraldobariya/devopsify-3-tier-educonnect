# resource "aws_rds_cluster" "edu-rds-cluster" {
#   cluster_identifier = "edu-rds-cluster"
#   engine = "aurora-postgresql"

#   engine_mode = "provisioned"

#   master_username = "root"
#   master_password = "root1234"

#   db_subnet_group_name = aws_db_subnet_group.rds-subnet-group.name
#   vpc_security_group_ids = [
#     aws_security_group.rds-sg.id
#   ]

#   skip_final_snapshot = true
# }

# resource "aws_rds_cluster_instance" "edu-rds-instance-1" {
#   identifier = "edu-rds-instance-1"
#   cluster_identifier = aws_rds_cluster.edu-rds-cluster.id
#   instance_class = "db.t3.medium"
#   engine = "aurora-postgresql"

#   publicly_accessible = false
#   availability_zone = data.aws_availability_zones.available.names[0]
# }

# resource "aws_rds_cluster_instance" "edu-rds-instance-2" {
#   identifier = "edu-rds-instance-2"
#   cluster_identifier = aws_rds_cluster.edu-rds-cluster.cluster_identifier
#   instance_class = "db.t3.medium"
#   engine = "aurora-postgresql"

#   publicly_accessible = false
#   availability_zone = data.aws_availability_zones.available.names[1]
# }


resource "aws_db_instance" "educonnect-db" {
  identifier = "educonnect-db"

  engine = "mysql" 
  engine_version = "8.0"

  instance_class = "db.t3.micro"

  allocated_storage = 20

  username = "root"
  password = "root1234"

  db_name = "edu_db"

  db_subnet_group_name = aws_db_subnet_group.rds-subnet-group.name

  vpc_security_group_ids = [
    aws_security_group.rds-sg.id
  ]

  publicly_accessible = false

  skip_final_snapshot = true

  multi_az = true

  tags = {
    Name = "educonnect-db"
  }
}


resource "aws_security_group" "rds-sg" {
  name = "rds-sg"
  vpc_id = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "rds-sg-ingress-worker" {
  security_group_id = aws_security_group.rds-sg.id
  referenced_security_group_id = var.worker-sg-id
  from_port = 3306
  to_port = 3306
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "rds-sg-egress-public" {
  security_group_id = aws_security_group.rds-sg.id
  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = "-1"
}

resource "aws_db_subnet_group" "rds-subnet-group" {
  name = "rds-subnet-group"
  subnet_ids = var.rds-subnet-ids
}