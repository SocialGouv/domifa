module.exports = async (manifests) => {
    const ns = manifests.find(
      (manifest) =>
        manifest.kind === "Namespace"
    )
    ns.metadata.annotations["janitor/ttl"] = "365d"
    return manifests
  }