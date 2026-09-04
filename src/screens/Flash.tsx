import { useEffect, useState } from "react";
import { Usb, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { Card } from "../components/ui";
import "esp-web-tools";
import "./Flash.css";

// esp-web-install-button only knows whether WebSerial exists in the API
// sense (navigator.serial) - it renders its "unsupported" slot for that,
// which we override below with more accurate copy (its own default text
// incorrectly lists Firefox as supported).
function useWebSerialSupport() {
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && "serial" in navigator);
  }, []);
  return supported;
}

export function Flash() {
  const supported = useWebSerialSupport();

  return (
    <div>
      <h1 className="page-title">Flash firmware</h1>

      <Card className="flash-card">
        <div className="flash-icon">
          <Usb size={22} weight="bold" />
        </div>
        <h2 className="flash-heading">Install Proink OS over USB</h2>
        <p className="flash-body">
          Connect your device to this computer with a USB cable (not WiFi - this writes directly to the device's
          internal flash), then click below. Your browser will ask you to pick the device's serial port.
        </p>

        {supported ? (
          <esp-web-install-button manifest="/proink-companion/firmware-manifest-v0.2.0.json">
            <button slot="activate" className="btn btn-primary flash-activate">
              <Usb size={16} weight="bold" /> Connect &amp; install
            </button>
            <span slot="unsupported" className="flash-unsupported">
              <WarningCircle size={16} /> Your browser doesn't support WebSerial. Use Chrome or Edge on desktop.
            </span>
            <span slot="not-allowed" className="flash-unsupported">
              <WarningCircle size={16} /> This page needs to be loaded over HTTPS to flash a device.
            </span>
          </esp-web-install-button>
        ) : (
          <p className="flash-unsupported">
            <WarningCircle size={16} /> Your browser doesn't support WebSerial. Use Chrome or Edge on desktop.
          </p>
        )}

        <ul className="flash-notes">
          <li>
            <CheckCircle size={14} weight="fill" /> Only rewrites the device's own firmware - your books, settings,
            and anything else on the SD card are untouched.
          </li>
          <li>
            <CheckCircle size={14} weight="fill" /> Always installs the latest published release.
          </li>
          <li>
            <CheckCircle size={14} weight="fill" /> Works from any computer - nothing to install beyond a supported
            browser.
          </li>
        </ul>
      </Card>

      <p className="flash-releases">
        See what's changed in each version on the{" "}
        <a href="https://github.com/thepropm/proink-os/releases" target="_blank" rel="noreferrer">
          releases page
        </a>
        .
      </p>
    </div>
  );
}
