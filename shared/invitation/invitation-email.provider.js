const nodemailer = require('nodemailer');
const q = require('q');
const BASE_FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3005';

class InvitationEmailProvider {
    constructor() {
        console.log('[InvitationEmailProvider] Initializing...');
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn('[InvitationEmailProvider] EMAIL_USER or EMAIL_PASSWORD missing in environment.');
            this.transporter = null;
        } else {
            console.log(`[InvitationEmailProvider] Using service: ${process.env.EMAIL_SERVICE || 'gmail'}, user: ${process.env.EMAIL_USER}`);
            this.transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE || 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        }
    }

    normalizeEmail(email) {
        if (!email) return '';
        return String(email).trim().toLowerCase();
    }

    _getTemplateWrapper(content, footerExtra = '') {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a202c; margin: 0; padding: 0; background-color: #f8fafc; }
                    .container { max-width: 580px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                    .header { padding: 32px 40px 0; text-align: left; }
                    .logo { font-size: 24px; font-weight: 800; color: #4f46e5; letter-spacing: -0.02em; }
                    .content { padding: 32px 40px; }
                    .footer { padding: 32px 40px; background-color: #f9fafb; border-top: 1px solid #f1f5f9; text-align: center; }
                    .btn { display: inline-block; padding: 12px 32px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; transition: background-color 0.2s; }
                    .secondary-link { color: #6366f1; text-decoration: none; font-weight: 600; font-size: 14px; }
                    h1 { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 16px; letter-spacing: -0.01em; }
                    p { margin: 0 0 16px; color: #4b5563; font-size: 15px; }
                    .badge { display: inline-block; padding: 2px 8px; background-color: #eef2ff; color: #4338ca; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">Heimer.</div>
                    </div>
                    <div class="content">
                        ${content}
                    </div>
                    <div class="footer">
                        ${footerExtra}
                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                            &copy; ${new Date().getFullYear()} Heimer &bull; Nền tảng quản lý công việc thế hệ mới<br/>
                            Bạn nhận được email này vì đang tham gia cộng tác trên hệ thống.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    sendSpaceInvitation(email, inviterName, spaceName, invitationToken, baseUrl = BASE_FRONTEND_URL) {
        const dfd = q.defer();

        // If email transporter is not configured, skip sending email but don't fail
        if (!this.transporter) {
            console.warn("Email transporter not configured. Skipping invitation email.");
            dfd.resolve({ success: true, skipped: true, message: "Email not configured" });
            return dfd.promise;
        }

        const normalizedEmail = this.normalizeEmail(email);

        if (!normalizedEmail) {
            dfd.reject({
                path: "InvitationEmail.sendSpaceInvitation",
                mes: "Email address is required"
            });
            return dfd.promise;
        }

        const acceptUrl = `${baseUrl}/join?token=${invitationToken}&type=space`;
        const mobileAppUrl = `heimer://join?token=${invitationToken}&type=space`;

        const content = `
            <div class="badge">Lời mời mới</div>
            <h1>Tham gia cùng đội ngũ</h1>
            <p>Xin chào,</p>
            <p><strong>${inviterName}</strong> vừa mời bạn tham gia cộng tác trong không gian làm việc chuyên nghiệp <span style="color: #111827; font-weight: 700;">"${spaceName}"</span> trên Heimer.</p>
            
            <div style="margin: 32px 0; text-align: center;">
                <a href="${acceptUrl}" class="btn">Xác nhận tham gia ngay</a>
            </div>

            <div style="padding: 16px; background-color: #f3f4f6; border-radius: 12px; margin-top: 32px;">
                <p style="margin-bottom: 8px; font-size: 13px; font-weight: 600; color: #6b7280;">Sử dụng điện thoại?</p>
                <a href="${mobileAppUrl}" class="secondary-link">Mở trong ứng dụng Heimer &rarr;</a>
            </div>
        `;

        const mailOptions = {
            from: `"Heimer Team" <${process.env.EMAIL_USER || 'noreply@heimer.com'}>`,
            to: normalizedEmail,
            subject: `🚀 ${inviterName} đã mời bạn vào "${spaceName}" trên Heimer`,
            html: this._getTemplateWrapper(content)
        };

        this.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('[InvitationEmailProvider] Failed to send email:', error);
                let errorMessage = "Failed to send invitation email";
                if (error.code === 'EAUTH') {
                    errorMessage = "Email authentication failed. Please check EMAIL_USER and EMAIL_PASSWORD configuration.";
                } else if (error.message) {
                    errorMessage = error.message;
                }
                dfd.reject({
                    path: "InvitationEmail.sendSpaceInvitation",
                    mes: errorMessage
                });
            } else {
                console.log('[InvitationEmailProvider] Email sent successfully:', info.response);
                dfd.resolve({ success: true, messageId: info.messageId });
            }
        });

        return dfd.promise;
    }

    sendProjectInvitation(email, inviterName, projectName, spaceName, invitationToken, baseUrl = (process.env.ADMIN_DOMAIN || 'http://localhost:3005'), taskId = null, taskName = null) {
        const dfd = q.defer();

        const normalizedEmail = this.normalizeEmail(email);

        if (!normalizedEmail) {
            dfd.reject({
                path: "InvitationEmail.sendProjectInvitation",
                mes: "Email address is required"
            });
            return dfd.promise;
        }

        if (!this.transporter) {
            dfd.reject({
                path: "InvitationEmail.sendProjectInvitation",
                mes: "Email service is not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables."
            });
            return dfd.promise;
        }

        const hasTaskAssignment = taskId; // Chỉ cần taskId là đủ
        
        const acceptUrl = `${baseUrl}/join?token=${invitationToken}&type=project`;
        const subject = hasTaskAssignment 
            ? `${inviterName} đã giao cho bạn một nhiệm vụ mới trên Heimer`
            : `${inviterName} đã mời bạn tham gia dự án "${projectName}" trên Heimer`;

        let heading, bodyText, badgeText;
        
        if (hasTaskAssignment) {
            badgeText = "Nhiệm vụ mới";
            heading = "Bạn có nhiệm vụ mới!";
            bodyText = `<strong>${inviterName}</strong> đã thêm bạn vào dự án <strong>"${projectName}"</strong>${spaceName ? ` (Không gian ${spaceName})` : ''} và giao cho bạn nhiệm vụ: <br/><span style="color: #4f46e5; font-weight: 700;">"${taskName || 'Nhiệm vụ mới'}"</span>`;
        } else {
            badgeText = "Dự án mới";
            heading = "Lời mời vào dự án";
            bodyText = `<strong>${inviterName}</strong> đã mời bạn tham gia vào dự án <strong>"${projectName}"</strong>${spaceName ? ` trong không gian ${spaceName}` : ''}.`;
        }

        const content = `
            <div class="badge">${badgeText}</div>
            <h1>${heading}</h1>
            <p>Xin chào,</p>
            <p>${bodyText}</p>
            
            <div style="margin: 32px 0; text-align: center;">
                <a href="${acceptUrl}" class="btn">${hasTaskAssignment ? 'Xem nhiệm vụ & Tham gia' : 'Tham gia dự án ngay'}</a>
            </div>
        `;

        const mailOptions = {
            from: `"Heimer Team" <${process.env.EMAIL_USER || 'noreply@heimer.com'}>`,
            to: normalizedEmail,
            subject: subject,
            html: this._getTemplateWrapper(content)
        };

        this.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Invitation email: Failed to send email:', error);
                let errorMessage = "Failed to send invitation email";
                if (error.code === 'EAUTH') {
                    errorMessage = "Email authentication failed. Please check EMAIL_USER and EMAIL_PASSWORD configuration.";
                } else if (error.message) {
                    errorMessage = error.message;
                }
                dfd.reject({
                    path: "InvitationEmail.sendProjectInvitation",
                    mes: errorMessage
                });
            } else {
                console.log('Invitation email sent:', info.response);
                dfd.resolve({ success: true, messageId: info.messageId });
            }
        });

        return dfd.promise;
    }

    sendTenantInvitation(email, inviterName, tenantName, invitationToken, baseUrl = (process.env.ADMIN_DOMAIN || 'http://localhost:3005')) {
        const dfd = q.defer();

        const normalizedEmail = this.normalizeEmail(email);

        if (!normalizedEmail) {
            dfd.reject({
                path: "InvitationEmail.sendTenantInvitation",
                mes: "Email address is required"
            });
            return dfd.promise;
        }

        if (!this.transporter) {
            dfd.reject({
                path: "InvitationEmail.sendTenantInvitation",
                mes: "Email service is not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables."
            });
            return dfd.promise;
        }

        const acceptUrl = `${baseUrl}/join?token=${invitationToken}&type=tenant`;

        const content = `
            <div class="badge">Tổ chức</div>
            <h1>Tham gia tổ chức</h1>
            <p>Xin chào,</p>
            <p><strong>${inviterName}</strong> đã mời bạn tham gia vào tổ chức <strong>"${tenantName}"</strong> trên hệ thống Heimer.</p>
            
            <div style="margin: 32px 0; text-align: center;">
                <a href="${acceptUrl}" class="btn">Chấp nhận lời mời</a>
            </div>
        `;

        const mailOptions = {
            from: `"Heimer Team" <${process.env.EMAIL_USER || 'noreply@heimer.com'}>`,
            to: normalizedEmail,
            subject: `${inviterName} đã mời bạn tham gia "${tenantName}" trên Heimer`,
            html: this._getTemplateWrapper(content)
        };

        this.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Invitation email: Failed to send email:', error);
                let errorMessage = "Failed to send invitation email";
                if (error.code === 'EAUTH') {
                    errorMessage = "Email authentication failed. Please check EMAIL_USER and EMAIL_PASSWORD configuration.";
                } else if (error.message) {
                    errorMessage = error.message;
                }
                dfd.reject({
                    path: "InvitationEmail.sendTenantInvitation",
                    mes: errorMessage
                });
            } else {
                console.log('Invitation email sent:', info.response);
                dfd.resolve({ success: true, messageId: info.messageId });
            }
        });

        return dfd.promise;
    }

    /**
     * Send channel chat invitation to a non-registered user
     */
    sendChannelInvitation(email, inviterName, channelName, baseUrl = BASE_FRONTEND_URL) {
        const dfd = q.defer();

        if (!this.transporter) {
            console.warn("Email transporter not configured. Skipping channel invitation email.");
            dfd.resolve({ success: true, skipped: true, message: "Email not configured" });
            return dfd.promise;
        }

        const normalizedEmail = this.normalizeEmail(email);

        if (!normalizedEmail) {
            dfd.reject({
                path: "InvitationEmail.sendChannelInvitation",
                mes: "Email address is required"
            });
            return dfd.promise;
        }

        const registerUrl = `${baseUrl}/register?ref=channel_invite&email=${encodeURIComponent(normalizedEmail)}`;

        const content = `
            <div class="badge">Trò chuyện</div>
            <h1>Lời mời tham gia kênh</h1>
            <p>Xin chào,</p>
            <p><strong>${inviterName}</strong> đã mời bạn tham gia thảo luận trong kênh <strong>"${channelName}"</strong> trên Heimer.</p>
            <p>Để bắt đầu nhắn tin và theo dõi thảo luận, bạn cần hoàn tất đăng ký tài khoản.</p>
            
            <div style="margin: 32px 0; text-align: center;">
                <a href="${registerUrl}" class="btn">Đăng ký tài khoản</a>
            </div>
        `;

        const mailOptions = {
            from: `"Heimer Team" <${process.env.EMAIL_USER || 'noreply@heimer.com'}>`,
            to: normalizedEmail,
            subject: `${inviterName} đã mời bạn tham gia kênh "${channelName}" trên Heimer`,
            html: this._getTemplateWrapper(content)
        };

        this.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Channel invitation email: Failed to send:', error);
                dfd.reject({
                    path: "InvitationEmail.sendChannelInvitation",
                    mes: error.message || "Failed to send channel invitation email"
                });
            } else {
                console.log('Channel invitation email sent:', info.response);
                dfd.resolve({ success: true, messageId: info.messageId });
            }
        });

        return dfd.promise;
    }
}

module.exports = new InvitationEmailProvider();


