from setuptools import find_packages, setup

with open("requirements.txt") as f:
    requirements = f.read().splitlines()

setup(
    name="neuroadaptive-bci",
    version="0.1.0",
    author="Gokulnaath",
    description="Neuroadaptive EdTech BCI ML Pipeline",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=requirements,
)
