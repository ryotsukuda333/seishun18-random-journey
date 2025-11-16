# Development container for Seishun18 Random Journey Generator
FROM node:20-bullseye

# Install essential tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Set user to non-root for security
RUN useradd -m -s /bin/bash developer && \
    chown -R developer:developer /workspace

USER developer

# Expose ports
# 5173: Vite dev server (frontend)
# 8787: Wrangler dev server (API)
EXPOSE 5173 8787

CMD ["/bin/bash"]
