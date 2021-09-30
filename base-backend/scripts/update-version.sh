#!/bin/sh
VERSION=4.2.0

find . -name 'package.json'|grep -v 'node_modules'|grep -v 'download'|while read fname; do
  echo "Checking ${fname}"
  sed -b -i "s/\(\"version\": \"\)\([0-9]\+\\.[0-9]\+\\.[0-9]\+\)\"/\1${VERSION}\"/g" ${fname}
  sed -b -i "s/\(codetogether-\)\([0-9]\+\\.[0-9]\+\\.[0-9]\+\)\\.vsix/\1${VERSION}.vsix/g" ${fname}
done

find . -name 'MANIFEST.MF'|while read fname; do
  echo "Checking ${fname}"
  sed -b -i "s/\(Bundle-Version: \)[0-9]\+\\.[0-9]\+\\.[0-9]\+\\./\1${VERSION}\\./g" ${fname}
done

find . -name 'feature.xml'|while read fname; do
  echo "Checking ${fname}"
  sed -b -i "s/\(version=\"\)[0-9]\+\\.[0-9]\+\\.[0-9]\+\\./\1${VERSION}\\./g" ${fname}
done

find . -name 'pom.xml'|grep ideclients|while read fname; do
  echo "Checking ${fname}"
  sed -b -i "s/\(.version.\)[1-9]\\.[0-9]\+\\.[0-9]\+\(-SNAPSHOT..version.\)/\1${VERSION}\2/g" ${fname}
done

find . -name 'build.gradle'|grep ideclients|while read fname; do
  echo "Checking ${fname}"
  sed -b -i "s/\(^version '\)[0-9]\+\\.[0-9]\+\\.[0-9]\+/\1${VERSION}/g"  ${fname}
done
