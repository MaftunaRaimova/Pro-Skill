"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const prisma_service_1 = require("./prisma.service");
const library_module_1 = require("./library/library.module");
const sms_module_1 = require("./sms/sms.module");
const courses_module_1 = require("./courses/courses.module");
const item_module_1 = require("./item/item.module");
const news_module_1 = require("./news/news.module");
const notes_module_1 = require("./notes/notes.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const message_module_1 = require("./message/message.module");
const admin_module_1 = require("./admin/admin.module");
const mentor_module_1 = require("./mentor/mentor.module");
const modules_module_1 = require("./modules/modules.module");
const lessons_module_1 = require("./lessons/lessons.module");
const questions_module_1 = require("./questions/questions.module");
const finances_module_1 = require("./finances/finances.module");
const payments_module_1 = require("./payments/payments.module");
const balls_module_1 = require("./balls/balls.module");
const check_module_1 = require("./check/check.module");
const chat_module_1 = require("./chat/chat.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            library_module_1.LibraryModule,
            library_module_1.LibraryModule,
            sms_module_1.SmsModule,
            courses_module_1.CoursesModule,
            item_module_1.ItemModule,
            news_module_1.NewsModule,
            notes_module_1.NotesModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '../..', 'uploads'),
                serveRoot: '../uploads',
            }),
            admin_module_1.AdminModule,
            message_module_1.MessageModule,
            mentor_module_1.MentorModule,
            modules_module_1.ModulesModule,
            lessons_module_1.LessonsModule,
            questions_module_1.QuestionsModule,
            finances_module_1.FinancesModule,
            payments_module_1.PaymentsModule,
            balls_module_1.BallsModule,
            check_module_1.CheckModule,
            chat_module_1.ChatModule,
            payments_module_1.PaymentsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map