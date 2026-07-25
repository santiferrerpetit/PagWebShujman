# Instrucciones para Claude

- Commits siempre en español, simples y directos.
- No agregar línea de co-autor (`Co-Authored-By: Claude...`) en los commits.
- Antes de mergear `develop` a `main` (o cualquier rama de otra persona), no asumir que un merge sin conflictos textuales es seguro: comparar con `git merge-tree` si hay lógica duplicada (features implementadas por separado en ambas ramas sobre el mismo modelo/tabla). Si la hay, avisar y pedir cómo resolver antes de tocar código.
