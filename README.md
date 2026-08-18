# Homebridge Tapo Ergin

A Homebridge plugin for controlling TP-Link Kasa and Tapo smart home devices using the `python-kasa` backend with full support for newer devices and protocols (including KLAP / Tapo L630 bulbs).

## Overview

This Homebridge plugin allows you to control TP-Link Kasa and Tapo devices within Apple HomeKit. It utilizes the robust `python-kasa` library in a managed local virtual environment to ensure high reliability and broad device compatibility across modern Tapo/Kasa devices.

## Requirements

- **Node.js**: `^20 || ^22 || ^24`
- **Python**: `3.11`, `3.12`, or `3.13`
- **Homebridge**: `^1.8.0` or `^2.0.0`

## Installation

### Via `hb-service` (Recommended for Homebridge Official Image)

```bash
sudo hb-service add https://github.com/ozturkergin/homebridge-tapo
```

### Via npm

```bash
sudo npm install -g https://github.com/ozturkergin/homebridge-tapo
```

## Configuration

Add the platform configuration to your Homebridge `config.json`:

```json
{
  "platforms": [
    {
      "platform": "KasaPythonPlatform",
      "name": "Tapo",
      "username": "your-tapo-email@example.com",
      "password": "your-tapo-password",
      "discoveryOptions": {
        "discoveryPollingInterval": 600000
      }
    }
  ]
}
```

### Configuration Options

| Option | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `platform` | string | **Yes** | Must be `"KasaPythonPlatform"` |
| `name` | string | **Yes** | Display name in Homebridge |
| `username` | string | **No** | Your TP-Link / Tapo account email (required for cloud-bound/authenticated devices) |
| `password` | string | **No** | Your TP-Link / Tapo account password |
| `discoveryOptions` | object | **No** | Customize device discovery intervals and exclusions |

## License

MIT