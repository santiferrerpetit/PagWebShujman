# Instrucciones para Claude

- Commits siempre en español, simples y directos.
- No agregar línea de co-autor (`Co-Authored-By: Claude...`) en los commits.
- Antes de mergear `develop` a `main` (o cualquier rama de otra persona), no asumir que un merge sin conflictos textuales es seguro: comparar con `git merge-tree` si hay lógica duplicada (features implementadas por separado en ambas ramas sobre el mismo modelo/tabla). Si la hay, avisar y pedir cómo resolver antes de tocar código.
- `main` y `develop` deben quedar con el mismo código. Cada vez que se commitea algo en `main`, replicar el mismo cambio en `develop` (y viceversa) en el mismo turno de trabajo, para que ninguna rama quede desactualizada respecto a la otra.
