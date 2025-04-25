        },
        printBackground: true,
        displayHeaderFooter: options?.includeHeaderFooter || false,
        headerTemplate: options?.headerText || '',
        footerTemplate: options?.footerText || '',
      };

      const pdf = await page.pdf(pdfOptions);
      return Buffer.from(pdf);

    } finally {
      await browser.close();
    }
  }

  private generateHTML(content: string, styles: string): string {
    const html = this.markdown.render(content);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>${styles}</style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }
}

