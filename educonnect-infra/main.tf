module "vpc-module" {
  source = "./modules/vpc"

}

module "eks-module" {
  source = "./modules/eks"

  worker-subnet-ids = module.vpc-module.worker-subnet-ids
  region = var.region
  vpc_id = module.vpc-module.vpc_id
  external-secret-role-arn = module.iam-module.external-secrets-role-arn
}

module "rds-module" {
  source = "./modules/rds"

  worker-sg-id = module.eks-module.worker-sg-id
  rds-subnet-ids = module.vpc-module.rds-subnet-ids
  vpc_id = module.vpc-module.vpc_id
}

module "iam-module" {
  source = "./modules/iam"

  oidc_arn = module.eks-module.oidc-arn
  oidc_url = module.eks-module.oidc-url
}