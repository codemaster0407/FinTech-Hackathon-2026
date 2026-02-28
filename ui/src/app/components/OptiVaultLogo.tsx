export function OptiVaultLogo({ size = 80 }: { size?: number }) {
  const src = "/logos/optivault-logo.png";

  return (
    <div style={{ width: size, height: size }} className="flex items-center justify-center">
      <img
        src={src}
        alt="OptiVault"
        style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'screen' }}
      />
    </div>
  );
}

export function OptiVaultLogoSmall({ size = 32 }: { size?: number }) {
  const src = "/logos/optivault-logo.png";

  return (
    <div style={{ width: size, height: size }} className="flex items-center justify-center">
      <img
        src={src}
        alt="OptiVault"
        style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'screen' }}
      />
    </div>
  );
}