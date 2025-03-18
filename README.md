# application

- // préciser le commit dans le projet github

message de commit :
  feat(C:Users):create "list()"fuction
  

- // envoyer du code 

commit :
  git commit -m "
  refs: #1 "
  
push : 
  git push


- // récurpérer le code 

git pull


- // récupérer/visualiser les modification faites sur le projet

fetch :
  git fetch --all
  

- // Créer une branche 

  1 ticket = 1 branche
  
  branch :
    git branch "nom_branche"
    
  nom de la branche : "feature/22-create-authentification"
                      "chore/..."


- // aller sur une branche

checkout :
  git checkout nom_brache


- // bonne pratique

diviser ses commit en plusieurs petits commit 


- // rejoue tous les commit de ta branche au dessus du head de la branche main

rebase :
  git rebase main 
  

- // orde d'éxecution

récupération :
  git fetch --all ->
  git pull ->
  git rebase 


- // pour spécifier une branche upstream(lien entre branche locale et distante)

  -u
  

- // après merge via github, suppression des branches, ne pas etre sur la branche que l'on veux supp

- local : git branch -D "nom-branch"

- distante : git branch -d "nom_remote" /*(souvent origin)*\ "nom_branch"

  test github discord
