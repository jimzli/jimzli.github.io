# frozen_string_literal: true

# Minify every .js file in the built site. Runs only for production builds
# (JEKYLL_ENV=production, as set by the GitHub Pages workflow) so local
# `jekyll serve` keeps readable, debuggable JS.
require "terser"

Jekyll::Hooks.register :site, :post_write do |site|
  next unless Jekyll.env == "production"

  terser = Terser.new(compress: true, mangle: true)

  Dir.glob(File.join(site.dest, "**", "*.js")).each do |path|
    source = File.read(path)
    minified = terser.compile(source)
    File.write(path, minified)
    Jekyll.logger.info "Minify JS:", path.sub("#{site.dest}/", "")
  end
end
