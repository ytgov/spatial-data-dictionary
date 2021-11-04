import nodemailer, { TransportOptions } from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { AuthUser } from "../data";
import { MAIL_CONFIG, MAIL_FROM, FRONTEND_URL, APPLICATION_NAME } from "../config";
import fs from "fs";
import path from "path";

const TRANSPORT = nodemailer.createTransport(MAIL_CONFIG as TransportOptions);

const BASE_TEMPLATE = "../templates/base.html";
const USER_CHANGE_TEMPLATE = "../templates/user-changed.html";
const ENTITY_CHANGING_TEMPLATE = "../templates/entity-changing.html";
const ENTITY_CHANGED_TEMPLATE = "../templates/entity-changed.html";
const CHANGE_ASSIGNED_TEMPLATE = "../templates/change-assigned.html";

export class EmailService {

    async sendPersonChangeNotification(user: AuthUser): Promise<any> {
        let templatePath = path.join(__dirname, USER_CHANGE_TEMPLATE);
        let content = fs.readFileSync(templatePath).toString();
        let fullName = `${user.first_name} ${user.last_name}`;

        return this.sendEmail(fullName, user.email, "Account Change", content);
    }

    async sendChangeCreateNotification(user: AuthUser, changeTitle: string, entityName: string, entityId: string, changeId: string) {
        let templatePath = path.join(__dirname, ENTITY_CHANGING_TEMPLATE);
        let content = fs.readFileSync(templatePath).toString();
        let fullName = `${user.first_name} ${user.last_name}`;

        content = content.replace(/``ENTITY_NAME``/g, entityName);
        content = content.replace(/``ENTITY_URL``/g, `${FRONTEND_URL}/entity/${entityId}/changes/${changeId}`);
        content = content.replace(/``CHANGE_TITLE``/g, changeTitle);

        return this.sendEmail(fullName, user.email, "Entity Change Approved", content)
    }

    async sendChangeCompleteNotification(user: AuthUser, changeTitle: string, entityName: string, entityId: string) {
        let templatePath = path.join(__dirname, ENTITY_CHANGED_TEMPLATE);
        let content = fs.readFileSync(templatePath).toString();
        let fullName = `${user.first_name} ${user.last_name}`;

        content = content.replace(/``ENTITY_NAME``/g, entityName);
        content = content.replace(/``ENTITY_URL``/g, `${FRONTEND_URL}/entity/${entityId}`);
        content = content.replace(/``CHANGE_TITLE``/g, changeTitle);

        return this.sendEmail(fullName, user.email, "Entity Change Completed", content)
    }

    async sendChangeAssignedNotification(user: AuthUser, changeTitle: string, entityName: string, entityId: string, changeId: string) {
        let templatePath = path.join(__dirname, CHANGE_ASSIGNED_TEMPLATE);
        let content = fs.readFileSync(templatePath).toString();
        let fullName = `${user.first_name} ${user.last_name}`;

        content = content.replace(/``ENTITY_NAME``/g, entityName);
        content = content.replace(/``ENTITY_URL``/g, `${FRONTEND_URL}/entity/${entityId}/changes/${changeId}`);
        content = content.replace(/``CHANGE_TITLE``/g, changeTitle);

        return this.sendEmail(fullName, user.email, "Entity Change Assigned to You", content)
    }

    async sendEmail(toName: string, toEmail: string, subject: string, customContent: string): Promise<any> {
        let basePath = path.join(__dirname, BASE_TEMPLATE);
        let baseContent = fs.readFileSync(basePath).toString();

        baseContent = baseContent.replace(/``CUSTOM_CONTENT``/, customContent);
        baseContent = baseContent.replace(/``APPLICATION_URL``/g, FRONTEND_URL);
        baseContent = baseContent.replace(/``APPLICATION_NAME``/g, APPLICATION_NAME);
        baseContent = baseContent.replace(/``TO_NAME``/g, toName);
        baseContent = baseContent.replace(/``TO_EMAIL``/g, toEmail);

        let message: MailOptions = {
            from: MAIL_FROM,
            to: `"${toName}" <${toEmail}>`,
            subject: `${subject} : ${APPLICATION_NAME}`,
            html: baseContent
        };

        return TRANSPORT.sendMail(message);
    }
}
