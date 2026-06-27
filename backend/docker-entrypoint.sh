#!/bin/bash
set -e

echo "Initializing directories..."
mkdir -p temp/input temp/output logs uploads

# The directories created above will be owned by 'node' because the script
# runs under the 'node' user inside the container (defined in Dockerfile).

echo "Starting PDFHub Worker..."
exec "$@"
