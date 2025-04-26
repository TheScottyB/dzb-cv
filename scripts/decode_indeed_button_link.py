import base64
import zlib
import sys
import json


def decode_indeed_button_link(encoded: str) -> str:
    # Clean up the encoded string for URL-safe base64
    s = encoded.replace('-', '+').replace('_', '/')
    # Pad with = if needed
    padding = '=' * (-len(s) % 4)
    s += padding
    # Base64 decode
    compressed = base64.b64decode(s)
    # Decompress (gzip/zlib)
    try:
        decoded = zlib.decompress(compressed, 16 + zlib.MAX_WBITS).decode('utf-8')
    except Exception as e:
        return f"Error decompressing: {e}"
    # Try to parse JSON and extract the 'u' field
    try:
        data = json.loads(decoded)
        return data.get('u', f"'u' field not found in JSON: {decoded}")
    except Exception as e:
        return f"Error parsing JSON: {e}\nDecoded string: {decoded}"


def main():
    # Example from user
    encoded = (
        "H4sIAAAAAAAA_02TSa-jSBCE_4ul8WnoB5jNT7JGZjE2q7EBLxdUQNlsxVqsrf7v456-"
        "jDKlVH4Rt1D8XPWr71WCcd19f32N4_gjLWMI4x9Rhb5q8IYg_oqK_J9XW6FdVoUpDYLPQQBHCQFLwrsGEIG0WGctzncsEaGEIj6T1oini2ib8SEQSIpgAPniXhwPNjTHcxy9RtWuXYN4R3DWowhfuUWKp1CI3pHWl8XNSx8G7qr5TqHjSaMfOS4xtVy2siOp5ebI3XKuvavqXZNgUzni-HwYykEjJbOA12DfOt2-2-6rQGi38WmSegIWHNYNMr7pqpapVh351nCnDhutcRxRY55ea_PdEdVOilg_lBWe8WUdBje4CenkiZ-eMVyGdj6Uoux2sfnu5jrdQBgNZViYypS7kMM-7mXgFyEtTjhAgcoEsZBXJYu2gBwO_TvTxMK4FebMalJnb5PpOoRj8ZrTwNQ5F0gnWX8VA33fG56mGZFvL6xim5kz1EuHQuJ0XUDeHKBGzZKdYUHcO2FfUpOLjqnV-xdJ7ntxOXuoho34Gs-LyjzkAFwEghtLinAgtXCRcJVZU4AYuEnxfm9Uemsvp1kk7hPpLcB48eGU7hnheSBuyMkG0iGuTY9Sx3Q5idifFnSUHxBAm82q6aKoLzrum3eann2XyISKHwx52Cus4Fl5W6YcgUovcE0gbZ3-RF55YOmp3ebMjdatkx3F7Zkvz4OWOaNiqR3CXn7Nfc-8Zo-G5pckGI3aeAEBjf1VUmPm8QDnloRyp4snv-6zd5tg-ebcU6eSXJJSwj4OGb29AM90wxz4k-YQ_uiauCIYCc2doOc6-YkmPGYzGZ0ZvgoPHA6n_bk_h0LlU9MyC-Bh0I46bhdJtwv2ABZxtnKQ88lMYtZm5cknerfyoxc5LQkg7ko6nbTGVfLyQLZK1RRoHinnr4382XWLdpt11oEdy7LcOgIo35Ue0hqbVoQ2PduVuhGbXKrGP_7V3yu0-v65ioo0yt2krfp38mknbnv4kf7QuYYfBOq6mD-sBi0ssZt_0O-v6rD0P5dn6ZZ9sz4K_u34r5SbTcuVbJ0KJLP69etfVkv6o_8DAAA"
    )
    print("Actual job posting URL:")
    print(decode_indeed_button_link(encoded))

if __name__ == "__main__":
    main() 