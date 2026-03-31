resource "aws_eks_node_group" "edu-nodegroup" {
  cluster_name = aws_eks_cluster.edu-cluster.name
  node_group_name = "eks-nodegroup"
  node_role_arn = aws_iam_role.workernode-role.arn

  subnet_ids = var.worker-subnet-ids

  scaling_config {
    desired_size = 2
    max_size = 3
    min_size = 1
  }

  capacity_type = "ON_DEMAND"

  launch_template {
    id = aws_launch_template.worker-lt.id
    version = "$Latest"
  }

  depends_on = [
    aws_eks_cluster.edu-cluster,
    aws_iam_role_policy_attachment.worker-node-policy,
    aws_iam_role_policy_attachment.cni-policy,
    aws_iam_role_policy_attachment.ecr-policy
  ]

}

resource "aws_security_group" "worker-sg" {
  name = "worker-sg"
  vpc_id = var.vpc_id
}

resource "aws_launch_template" "worker-lt" {
  instance_type = "t3.small"
  
  block_device_mappings {
    device_name = "/dev/xvda"

    ebs {
      volume_size = 20
      volume_type = "gp3"
    }
  }
  
  network_interfaces {
    security_groups = [
      aws_eks_cluster.edu-cluster.vpc_config[0].cluster_security_group_id,
      aws_security_group.worker-sg.id
    ]
  }
}


resource "aws_iam_role" "workernode-role" {
  name = "workernode-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sts:AssumeRole"
        ]
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "worker-node-policy" {
  role       = aws_iam_role.workernode-role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "cni-policy" {
  role       = aws_iam_role.workernode-role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "ecr-policy" {
  role       = aws_iam_role.workernode-role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}