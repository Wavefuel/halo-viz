ARG ELASTIC_VERSION

# https://www.docker.elastic.co/
FROM docker.elastic.co/kibana/kibana:${ELASTIC_VERSION}

# Switch to root user to copy files and set permissions
USER root

# Copy your plugin into the Kibana plugins directory
COPY ./plugins/haloBranding-8.13.4.zip /usr/share/kibana/plugins/halo-branding.zip

RUN chown kibana:kibana /usr/share/kibana/plugins/halo-branding.zip

# Install the plugin
USER kibana
RUN /usr/share/kibana/bin/kibana-plugin install file:///usr/share/kibana/plugins/halo-branding.zip

# Add your kibana plugins setup here
# Example: RUN kibana-plugin install <name|url>
