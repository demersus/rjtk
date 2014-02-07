$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "rjtk/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "rjtk"
  s.version     = Rjtk::VERSION
  s.authors     = ["Nik Petersen"]
  s.email       = ["demersus@gmail.com"]
  s.homepage    = ""
  s.summary     = "Useful javascript utilities for rails development"
  s.description = "Useful javascript utilities for rails development, bundled into a little toolkit"

  s.files = Dir["{vendor,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.markdown"]
end
